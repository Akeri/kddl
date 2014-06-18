var elements = require("../services/elements.js");

/**
 * Player
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    
  schema : true,
    
  ranks : {
    commander : {
      name    : "Commander",
      bonus   : 0
    },
    highcommander : {
      name    : "High Commander",
      bonus   : 5
    },
    champion : {
      name    : "Guild Champion",
      bonus   : 7
    },
    sentinel : {
      name    : "Guild Sentinel",
      bonus   : 7
    },
    guildmaster : {
      name    : "Guild Master",
      bonus   : 10
    }
  },
  
  types : {
    rank : function(value){
      return value == null || Object.keys(Player.ranks).indexOf(value) != -1;
    },
    level : function(value){
      return _.isFinite(value) && value >= 0;
    }
  },

  attributes: {
  	
    name : {
      type       : "string",
      required   : true
    },
    
    main : {
      type       : "boolean",
      defaultsTo : false
    },
    
    level : {
      type       : "level"
    },
    
    description : {
      type       : "string"
    },
    
    guildId : {
      type       : "string",
      defaultsTo : null
    },
    
    guildRank : {
      type       : "rank",
      defaultsTo : null
    },
    
    userId : {
      type       : "string",
      defaultsTo : null
    },
    
    captions : {
      type       : "array"
    },
    
  },
  
  completeWithArmors : function(mapPlayers, next){
    _.each(mapPlayers, function(player){
      player.armors = [];
    });
    PlayerArmor.find({playerId : Object.keys(mapPlayers), fused : null})
      .sort("level desc")
      .then(function(armors){
        _.each(armors, function(armor){
          var player = mapPlayers[armor.playerId];
          player.armors.push(armor);
        });
        return next(undefined, armors);
      })
      .fail(function(err){
        return next(err);
      });
  },
  
  completeWithDetailedArmors : function(mapPlayers, next){
    Player.completeWithArmors(mapPlayers, function foundPlayerArmors(err, playerArmors){
      if (err) return next(err);
      var armorIds = _.map(playerArmors, function(playerArmor){ return playerArmor.armorId; });
      Armor.find({id : armorIds})
        .then(function foundArmors(armors){
          if (err) return next(err);
          _.each(armors, function(armor){
            var matchedPlayerArmors = _.filter(playerArmors, function(playerArmor){
              return playerArmor.armorId == armor.id;
            });
            _.each(matchedPlayerArmors, function(playerArmor){
              playerArmor.armor = armor;
              playerArmor.power = Armor.getPower(armor, playerArmor.plus, playerArmor.level);
            });
          });
          next();
        })
        .fail(function failed(err){
          return next(err);
        });
    });
  },
  
  completeWithPower : function(mapPlayers, next){
    var combos = elements.getAllCombos();
    combos.pop(); // Exclude starmetal combo
    _.each(mapPlayers, function(player){
      var power = {
        groups  : [],
        base    : 0,
        score   : 0,
        bonus   : {
          pctg  : 0,
          score : 0
        }
      };
      player.power = power;
      var armors = _.groupBy(player.armors, function(playerArmor){ // Group by elements combo
        var groupIndex = elements.normalize(playerArmor.armor.elements).join("-");
        return groupIndex;
      });
      _.each(combos, function(combo){
        var groupIndex = elements.normalize(combo).join("-");
        var group = {
          elements : combo,
          elemUi   : Armor.getElemIcons(combo),
          count    : 0,
          score    : 0
        };
        var groupArmors = armors[groupIndex];
        power.groups.push(group);
        if (!groupArmors) return;
        group.count = _.size(groupArmors);
        groupArmors.sort(function(a, b){
          return b.power - a.power;
        });
        groupArmors = groupArmors.slice(0, 3); // Only 3 armors of the same combo are useful
        _.each(groupArmors, function(playerArmor, i){
          group.score += playerArmor.power * (1 - (i * .25));
        });
        power.base += group.score;
      });
      if (player.guildRank != null){
        power.bonus.pctg = Player.ranks[player.guildRank].bonus;
        power.bonus.score = power.base * (power.bonus.pctg / 100);
        power.score = power.base + power.bonus.score;
      }else{
        power.score = power.base;
      };
    });
    next();
  },
  
  completeWithGuild : function(mapPlayers, next){
    var guildIds = [];
    _.each(mapPlayers, function(player){
      if (player.guildId != null) guildIds.push(player.guildId);
    });
    Guild.find()
      .where({ id : _.uniq(guildIds) })
      .exec(function(err, guilds){
        if (err) return next(err);
        if (guilds.length){
          var mapGuilds = _.indexBy(guilds, "id");
          _.each(mapPlayers, function(player){
            player.guild = mapGuilds[player.guildId] || null;
          });
        }
        next();
      });
  },
  
  completeWithUser : function(mapPlayers, next){
    var userIds = [];
    _.each(mapPlayers, function(player){
      if (player.userId != null) userIds.push(player.userId);
    });
    User.find()
      .where({ id : _.uniq(userIds) })
      .exec(function(err, users){
        if (err) return next(err);
        if (users.length){
          _.each(users, function(user){
            delete user.encryptedPassword;
          });
          var mapUsers = _.indexBy(users, "id");
          _.each(mapPlayers, function(player){
            player.user = mapUsers[player.userId] || null;
          });
        }
        next();
      });
  },
  
  completeWithAll : function(mapPlayers, next){
    Player.completeWithGuild(mapPlayers, function(err){
      if (err) return next(err);
      Player.completeWithDetailedArmors(mapPlayers, function(err){
        if (err) return next(err);
        Player.completeWithPower(mapPlayers, function(err){
          if (err) return next(err);
          next();
        });
      });
    });
  },
  
  beforeValidation : function(values, next){
    // Process main
    if (_.isString(values.main)) values.main = values.main == "on";
    // Process guild
    if (values.guildId == "null") values.guildId = null;
    // Process rank
    if (values.guildRank == "null") values.guildRank = null;
    // Process captions
    if (_.isString(values.captions)){
      var captions = [];
      values.captions = values.captions.split(",");
      _.each(values.captions, function(caption){
        if (caption != "") captions.push(caption.trim());
      });
      values.captions = captions;
    }
    next();
  },
  
  afterValidation : function(values, next){
    var more = function(){
      var more = function(){
        return next();
      };
      // Switch off previous main if necessary
      if (values.userId && values.main === true){
        Player.update({userId : values.userId, main : true}, {main : false}, function(err, players){
          if (err) return next(err);
          return more();
        });
      }else
        return more();
    };
    more();
  },
  
  beforeCreate : function(values, next){
    var more = next;
    // Check the owner user has not already a player with the same name
    if (values.userId){
      Player.findOne({name : values.name, userId : values.userId})
      .then(function foundPlayer(player){
        if (player) return next({
          err : [{
            message : "You already have a player with the same name"
          }]
        });
        return more();
      }).fail(function failed(err){
        return next(err);
      });
    }else
      return more();
  }

};
  