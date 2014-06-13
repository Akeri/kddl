/**
 * ArmorController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
  crawling : false,
  cancelCrawling : false,
  
  index : function(req, res){
    Armor.find()
      .sort("name")
      .then(function foundUsers(armors){
        res.view({
          armors : armors
        });
      }).fail(function failed(err){
        return next(err);
      });
  },
    
  "new" : function(req, res){
    res.view();
  },
  
  show : function(req, res, next){
    Armor.findOne(req.param("id"), function foundArmor(err, armor){
      if (err) return next(err);
      if (!armor) return next();
      res.view({
        armor : armor
      });
    });
  },
  
  destroy : function(req, res, next){
    var armorId = req.param("id");
    Armor.findOne({id : armorId}, function foundArmor(err, armor){
      if (err) return next(err);
      if (!armor){
        req.session.flash = {
          err : [{ message : "Armor not found" }]
        };
        return res.redirect("/session/new");
      }
      Armor.destroy(armorId, function armorDestroyed(err){
        if (err) return next(err);
        req.session.flash = {
            success : [{ message : "Armor " +  armor.name + " has been deleted" }]  
        };
        PlayerArmor.destroy({armorId : armorId}, function(err){
          if (err) return next(err);
          res.redirect("/armor");
        });
      });
    });
  },
  
  crawler : function(req, res){
    res.view();
  },
  
  crawlStop : function(req){
    if (this.crawling) this.cancelCrawling = true;
  },
  
  crawlStart : function(req){
    var self = this;
    this.crawling = true;
    var socket = sails.io.sockets.socket(req.socket.id);
    var crawler = require("../services/wikiacrawler.js");
    var mode = req.param("m");
    var r = req.param("r"), rarities;
    if (r) rarities = r.split(",");
      else rarities = Object.keys(crawler.rarities);
    var overview = {
      scanned : 0
    };
    var crawlCancel = function(){
      self.crawling = false;
      self.cancelCrawling = false;
      socket.emit("crawlCancel", "terminated by client"); // emit canceled status
    };
    // function to iterate over rarities recursively
    var inspectRarities = function(i, rarities, end){
      // get rarity object
      var key = rarities[i];
      var rarity = crawler.rarities[key];
      socket.emit("updateProgress", { // emit progress step
        value     : 0,
        status    : "indexing <strong>" + Armor.rarities[key].name + "</strong> armors"
      });
      // inspect rarity
      crawler.retrieveArmorIndexByRarity(
        rarity,
        function gotArmorIndex(armors){
          // gor rarity index
          var armorStep = 100 / armors.length;
          // start loop for this rarity
          inspectArmors(0, armors,
            function(){
              if (++i == rarities.length) return end(); // last rarity?
              if (self.cancelCrawling) return crawlCancel();
              inspectRarities(i, rarities, end);
            }, armorStep);
        },
        function(){}
      );
    };
    // function to iterate over armors recursively
    var inspectArmors = function(i, armors, end, step){
      var armor = armors[i];
      if (!armor) return end();
      overview.scanned++;
      socket.emit("updateProgress", { // emit progress step
        value     : step * (i + 1),
        status    : "scanning <strong>" + armor.name + "</strong>"
      });
      var next = function(){
        if (++i == armors.length) return end(); // last armor?
        if (self.cancelCrawling) return crawlCancel();
        inspectArmors(i, armors, end, step); // inspect next one
      };
      Armor.findOne() // look for this armor on db
        .where({ wikiaLink : armor.wikiaLink })
        .then(function(dbArmor){
          if (mode == "basic" && dbArmor) return next(); // ignore this, inspect next one;
          crawler.inspectArmor(armor,
            function gotArmor(armor){
              // got new armor object
              if (!dbArmor){
                crawler.downloadArmorPics(armor, function(armor){
                  Armor.create(armor, function armorStored(err, storedArmor){
                    if (err) return console.log("Error storing " + armor.name + ":", err);
                    socket.emit("newArmor", storedArmor);
                  });
                });
              }else{
                crawler.downloadArmorPics(armor, function(armor){
                  Armor.update(dbArmor.id, armor, function armorUpdated(err, updatedArmors){
                    if (err) return console.log("Error updating " + armor.name + ":", err);
                    var diff = Armor.compare(dbArmor, armor);
                    if (!_.isEmpty(diff)) socket.emit("updateArmor", {
                      armor   : updatedArmors.shift(),
                      changes : diff
                    });
                  });
                });
              }
              next();
            },
            function gotError(error){
//              console.log(error);
              next();
            }
          );
        })
      ;
    };
    // start main loop
    inspectRarities(0, rarities, function(){
      // notice end of crawling to client
      self.crawling = false;
      self.cancelCrawling = false;
      socket.emit("crawlEnd", overview);
    });
  }
  
};
