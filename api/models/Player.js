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
  
  completeWithArmors : function(players, next){
    var mapPlayers = _.indexBy(players, "id");
    PlayerArmor.find({playerId : Object.keys(mapPlayers), fused : null})
      .sort("level desc")
      .then(function(armors){
        _.each(armors, function(armor){
          var player = mapPlayers[armor.playerId];
          if (!player.armors) player.armors = [];
          player.armors.push(armor);
        });
        return next();
      })
      .fail(function(err){
        return next(err);
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
  