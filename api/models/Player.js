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
      name    : "Commander"
    },
    highcommander : {
      name    : "High Commander"
    },
    champion : {
      name    : "Guild Champion"
    },
    sentinel : {
      name    : "Guild Sentinel"
    },
    guildmaster : {
      name    : "Guild Master"
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
            });
          });
          next();
        })
        .fail(function failed(err){
          return next(err);
        });
    });
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
  
  completeWithAll : function(mapPlayers, next){
    Player.completeWithGuild(mapPlayers, function(err){
      if (err) return next(err);
      Player.completeWithDetailedArmors(mapPlayers, function(err){
        if (err) return next(err);
        next();
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
  