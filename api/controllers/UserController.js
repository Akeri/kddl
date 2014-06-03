var flash = require("../services/flashmaker.js");

/**
 * UserController
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
  
  "new" : function(req, res){
    res.view();
  },
  
  create : function(req, res, next){
    User.create(req.params.all(), function userCreated(err, user){
      if (err){
        req.session.flash = flash.from(err);
        return res.redirect("/user/new");
      }
      req.session.flash = {
        success : [{ message : "User " + user.nickname + " created successfully" }]
      };
      res.redirect("/user");
    });
  },
  
  // render the user view
  show : function(req, res, next){
    User.findOne(req.param("id"), function foundUser(err, user){
      if (err) return next(err);
      if (!user) return next();
      Player.find({userId : user.id})
        .sort({main : "desc", name : "desc"})
        .exec(function foundPlayers(err, players){
          if (err) return next(err);
          user.players = players;
          res.view({
            user : user
          });   
      });
    });
  },
  
  // render the user profile
  profile : function(req, res, next){
    User.findOne(req.param("id"), function foundUser(err, user){
      if (err) return next(err);
      if (!user) return next();
      Player.find({userId : user.id})
        .sort({main : "desc", name : "asc"})
        .exec(function foundPlayers(err, players){
          if (err) return next(err);
          var end = function(mapArmors){
            user.players = players;
            res.view({
              user   : user,
              armors : mapArmors || null
            });
          };
          if (!players.length) return end();
          var guildIds = [];
          _.each(players, function(player){
            player.armors = [];
            if (player.guildId != null) guildIds.push(player.guildId);
          });
          Guild.find()
            .where({ id : _.uniq(guildIds) })
            .exec(function(err, guilds){
              if (err) return next(err);
              if (guilds.length){
                var mapGuilds = _.indexBy(guilds, "id");
                _.each(players, function(player){
                  player.guild = mapGuilds[player.guildId] || null;
                });
              }
              Player.completeWithArmors(players, function foundPlayerArmors(err){
                if (err) return next(err);
                var armorIds = [];
                _.each(players, function(player){
                  _.each(player.armors, function(playerArmor){
                    armorIds.push(playerArmor.armorId);
                  });
                });
                Armor.find({id : armorIds})
                  .then(function foundArmors(armors){
                    if (err) return next(err);
                    var mapArmors = _.indexBy(armors, "id");
                    end(mapArmors);
                  })
                  .fail(function failed(err){
                    return next(err);
                  });
              });
            });
      });
    });
  },
  
  // render the user profile edit
  profilEedit : function(req, res, next){
    User.findOne(req.param("id"), function foundUser(err, user){
      if (err) return next(err);
      if (!user) return next();
      Player.find({userId : user.id})
        .sort({main : "desc", name : "asc"})
        .exec(function foundPlayers(err, players){
          if (err) return next(err);
          user.players = players;
          res.view("user/profile_edit.ejs", {
            user : user
          });   
      });
    });
  },
  
  index : function(req, res, next){
    User.find()
      .sort("nickname")
      .then(function foundUsers(users){
        res.view({
          users : users
        });
      }).fail(function failed(err){
        return next(err);
      });
  },
  
  // render de edit view
  edit : function(req, res, next){
    User.findOne(req.param("id"), function foundUser(err, user){
      if (err) return next(err);
      if (!user) return next("User doesn't exist.");
      res.view({
        user : user
      });
    });
  },
  
  // perform the update operation
  update : function(req, res, next){
    var values = req.params.all();
    delete values.id;
    delete values.createdAt;
    delete values.updatedAt;
    User.update(req.param("id"), values, function userUpdated(err){
      if (err){
        req.session.flash = flash.from(err);
        return res.redirect("/user/edit/" + req.param("id"));
      }
      req.session.flash = {
        success : [{ message : "User " + values.nickname + " updated successfully" }]
      };
      res.redirect("/user/profile/" + req.param("id"));
    });
  },
  
  // perform the profile update operation
  profileUpdate : function(req, res, next){
    var values = req.params.all();
    delete values.id;
    delete values.captions;
    delete values.role;
    delete values.createdAt;
    delete values.updatedAt;
    User.update(req.param("id"), values, function userUpdated(err){
      if (err){
        req.session.flash = flash.from(err);
        return res.redirect("/user/profile/" + req.param("id") + "/edit");
      }
      req.session.flash = {
        success : [{ message : "Profile updated successfully" }]
      };
      res.redirect("/user/profile/" + req.param("id"));
    });
  },
  
  // perform a password change operation
  passwordUpdate : function(req, res, next){
    var values = req.params.all();
    var sendErr = function(msg){
      req.session.flash = {err : msg};
      res.redirect("/user/profile/" + values.id + "/edit");
    };
    User.findOne(values.id, function foundUser(err, user){
      if (err) return next(err);
      require("bcrypt").compare(values.passwordActual, user.encryptedPassword, function(err, valid){
        if (err) return next(err);
        if (!valid) return sendErr([{
          name    : "InvalidActualPassword",
          message : "You incorrectly typed your actual password"
        }]);
        User.processPassword(values, function(err){
          if (err) return sendErr(err);
          User.update(req.param("id"), { encryptedPassword : values.encryptedPassword }, function passwordUpdated(err){
            if (err) return sendErr(err);
            req.session.flash = {
              success : [{ message : "Password changed successfully" }]
            };
            res.redirect("/user/profile/" + req.param("id"));
          });
        });
      });
    });
  },
  
  // perform destroy operation
  destroy : function(req, res, next){
    var userId = req.param("id");
    var redirect = function(){
      res.redirect("/user");
    };
    User.findOne(userId, function foundUser(err, user){
      if (err) return next(err);
      if (!user) return next("User doesn't exist.");
      User.destroy(userId, function userDestroyed(err){
        if (err) return next(err);
        // Delete bound players if asked for it
        if (req.param("deletePlayers") == "on"){
          Player.destroy({userId : userId}, function playersDestroyed(err){
            if (err) return next(err);
            return redirect();
          });
        }else{
        // Else just unbound them
          Player.update({userId : userId}, {userId : null}, function playersUpdated(err){
            if (err) return next(err);
            return redirect();
          });
        }
      });
    });
  }
  
};
