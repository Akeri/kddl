var flash = require("../services/flashmaker.js");

/**
 * PlayerController
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
    Guild.find()
      .sort("name")
      .then(function foundGuilds(guilds){
        res.view({
          guilds : guilds,
          userId : req.param("userId")
        });
      }).fail(function failed(err){
        return next(err);
      });
  },
  
  edit : function(req, res, next){
    Player.findOne(req.param("id"), function foundPlayer(err, player){
      if (err) return next(err);
      if (!player) return next("Player doesn't exist.");
      Guild.find()
        .sort("name")
        .then(function foundGuilds(guilds){
          res.view({
            player : player,
            userId : req.param("userId"),
            guilds : guilds
          });
        }).fail(function failed(err){
          return next(err);
        });
    });
  },
  
  create : function(req, res, next){
    var userId = req.param("userId");
    User.findOne(userId, function foundUser(err, user){
      if (err) return next(err);
      if (!user){
        req.session.flash = {
          err : [{ message : "User with id '" + userId + "' doesn't exist" }]
        };
        return res.redirect("/session/new");
      }
      values = req.params.all();
      delete values.id;
      Player.create(values, function playerCreated(err, player){
        if (err){
          req.session.flash = flash.from(err);
          return res.redirect("/user/" + userId + "/player/new");
        }
        req.session.flash = {
          success : [{ message : "Player " + player.name + " created successfully" }]
        };
        res.redirect("/user/profile/" + player.userId);
      });
    });
  },
  
  update : function(req, res, next){
    var values = req.params.all();
    delete values.id;
    Player.update(req.param("id"), values, function playerUpdated(err, players){
      if (err){
        req.session.flash = flash.from(err);
        return res.redirect("back");
      }
      if (!players.length){
        req.session.flash = flash.from({
          err : [{ message : "Player not found" }]
        });
        return res.redirect("back");
      }
      req.session.flash = {
        success : [{ message : "Player " + values.name + " updated successfully" }]
      };
      res.redirect("/user/profile/" + req.param("userId"));
    });
  },
  
  turnMain : function(req, res, next){
    var userId = req.param("userId");
    var playerId = req.param("id");
    Player.update({id : playerId, userId : userId}, {main : true, userId : userId}, function playerUpdated(err, player){
      if (err) return next(err);
      return res.redirect("back");
    });
  },
  
  destroy : function(req, res, next){
    var userId = req.param("userId");
    var playerId = req.param("id");
    Player.findOne({id : playerId, userId : userId}, function foundPlayer(err, player){
      if (err) return next(err);
      if (!player){
        req.session.flash = {
          err : [{ message : "User with id '" + userId + "' doesn't own a player with id '" + playerId + "'" }]
        };
        return res.redirect("/session/new");
      }
      Player.destroy(playerId, function playerDestroyed(err){
        if (err) return next(err);
        req.session.flash = {
            success : [{ message : "Player " +  player.name + " has been deleted" }]  
        };
        PlayerArmor.destroy({playerId : playerId}, function(err){
          if (err) return next(err);
          res.redirect("back");
        });
      });
    });
  },
  
  editArmors : function(req, res, next){
    var playerId = req.param("id");
    Player.findOne(playerId, function foundPlayer(err, player){
      if (err) return next(err);
      if (!player){
        req.session.flash = {
          err : [{ message : "Player id '" + playerId + "' doesn't exist" }]
        };
        return res.redirect("back");
      }
      var userId = req.param("userId");
      User.findOne(userId, function foundUser(err, user){
        if (err) return next(err);
        var mapPlayers = _.indexBy([player], "id");
        Player.completeWithArmors(mapPlayers, function foundPlayerArmors(err){
          if (err) return next(err);
          Armor.find()
            .sort("name")
            .then(function foundArmors(armors){
              if (err) return next(err);
              var mapArmors = _.indexBy(armors, "id");
              _.each(player.armors, function(playerArmor){
                playerArmor.armor = mapArmors[playerArmor.armorId];
              });
              var avm = req.param("avm") || req.session.armorsViewMode || "mosaic";
              req.session.armorsViewMode = avm;
              res.view("player/edit_armors.ejs", {
                user       : user,
                player     : player,
                armors     : armors,
                armorsView : avm
              });
            })
            .fail(function failed(err){
              return next(err);
            });
        });
      });
    });
  },
  
  ownArmor : function(req, res, next){
    var userId = req.param("userId");
    var playerId = req.param("playerId");
    Player.findOne({id : playerId, userId : userId}, function foundPlayer(err, player){
      if (err) return next(err);
      if (!player){
        req.session.flash = {
          err : [{ message : "Invalid player" }]
        };
        return res.redirect("/session/new");
      }
      values = req.params.all();
      delete values.id;
      PlayerArmor.create(values, function playerArmorCreated(err, playerArmor){
        if (err){
          req.session.flash = flash.from(err);
          return res.redirect("back");
        }
        req.session.flash = {
          success : [{ message : "Armor owned successfully" }]
        };
        res.redirect("back");
      });
    });
  },
  
  updateOwnedArmor : function(req, res, next){
    var values = req.params.all();
    delete values.id;
    PlayerArmor.update({ id : req.param("id"), playerId : values.playerId }, values, function playerArmorUpdated(err, players){
      if (err){
        req.session.flash = flash.from(err);
        return res.redirect("back");
      }
      if (!players.length){
        req.session.flash = flash.from({
          err : [{ message : "Player not found" }]
        });
        return res.redirect("back");
      }
      req.session.flash = {
        success : [{ message : "Armor updated successfully" }]
      };
      res.redirect("back");
    });
  },
  
  deleteOwnedArmor : function(req, res, next){
    var playerId = req.param("playerId");
    var playerArmorId = req.param("id");
    PlayerArmor.findOne({id : playerArmorId, playerId : playerId}, function foundPlayerArmor(err, playerArmor){
      if (err) return next(err);
      if (!playerArmor){
        req.session.flash = {
          err : [{ message : "Player with id '" + playerId + "' doesn't own an armor with id '" + playerArmorId + "'" }]
        };
        return res.redirect("/session/new");
      }
      PlayerArmor.destroy(playerArmorId, function playerArmorDestroyed(err){
        if (err) return next(err);
        req.session.flash = {
          success : [{ message : "Armor deleted successfully" }]  
        };
        res.redirect("back");
      });
    });
  },
  
  fuseOwnedArmor : function(req, res, next){
    var values = {
      fused : new Date()
    };
    PlayerArmor.update({ id : req.param("id"), playerId : req.param("playerId") }, values, function playerArmorFused(err, players){
      if (err){
        req.session.flash = flash.from(err);
        return res.redirect("back");
      }
      if (!players.length){
        req.session.flash = flash.from({
          err : [{ message : "Player not found" }]
        });
        return res.redirect("back");
      }
      req.session.flash = {
        success : [{ message : "Armor fused successfully" }]
      };
      res.redirect("back");
    });
  },
  
  kick : function(req, res, next){
    var playerId = req.param("playerId");
    Player.update({ id : playerId }, { guildId : null, guildRank : null }, function playerKicked(err, players){
      if (err){
        req.session.flash = flash.from(err);
        return res.redirect("back");
      }
      if (!players.length){
        req.session.flash = flash.from({
          err : [{ message : "Player not found" }]
        });
        return res.redirect("back");
      }
      req.session.flash = {
        success : [{ message : players[0].name + " was kicked" }]
      };
      res.redirect("back");
    });
  }
  
};
