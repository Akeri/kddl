var elements = require("../services/elements.js");

/**
 * Armor
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    
  rarities : {
    "nemesis" : {
      name        : "nemesis",
      maxLevel    : 50
    },
    "common" : {
      name        : "common",
      maxLevel    : 30
    },
    "uncommon" : {
      name        : "uncommon",
      maxLevel    : 30
    },
    "rare" : {
      name        : "rare",
      maxLevel    : 50
    },
    "superrare" : {
      name        : "super rare",
      maxLevel    : 50
    },
    "ultrarare" : {
      name        : "ultra rare",
      maxLevel    : 70
    },
    "legendary" : {
      name        : "legendary",
      maxLevel    : 70
    },
    "epic" : {
      name        : "epic",
      maxLevel    : 99
    }
  },
  
  defaultPic : "/linker/images/question_shield.png",
    
  schema : true,
  
  types : {
    
    element : function(value){
      return Object.keys(elements).indexOf(value) != -1;
    },
    
    elements : function(value){
      for (var i = 0; i < value.length; i++){
        if (!Armor.types.element(value[i])) return false;
      }
      return true;
    },
    
    rarity : function(value){
      return Object.keys(Armor.rarities).indexOf(value) != -1;
    }
    
  },

  attributes : {
  	
  	name : {
  	  type       : "string",
  	  required   : true,
  	  unique     : true
  	},
  	
  	mainPic : {
  	  type   : "string"
  	},
  	
  	secondaryPic : {
  	  type   : "string"
  	},
  	
  	rarity : {
  	  type   : "rarity"
  	},
  	
  	elements : {
  	  type   : "array"
  	},
  	
  	maxLevel : {
  	  type   : "integer"
  	},
  	
  	regBaseAtt : {
  	  type   : "integer"
  	},
  	
  	regBaseDef : {
  	  type   : "integer"
  	},
  	
  	regMaxAtt : {
  	  type   : "integer"
  	},
  	
  	regMaxDef : {
  	  type   : "integer"
  	},
  	
  	regAttStep : {
  	  type   : "integer"
  	},
  	
  	regDefStep : {
  	  type   : "integer"
  	},
  	
  	plusBaseAtt : {
      type   : "integer"
    },
    
    plusBaseDef : {
      type   : "integer"
    },
    
    plusMaxAtt : {
      type   : "integer"
    },
    
    plusMaxDef : {
      type   : "integer"
    },
    
    plusAttStep : {
      type   : "integer"
    },
    
    plusDefStep : {
      type   : "integer"
    },
    
    wikiaLink : {
      type   : "string"
    }
    
  },
  
  getElemIcons : function(elems){
    if (!elems) return "";
    var icons = "";
    for (var i = 0; i < elems.length; i++){
      var elem = elements.elements[elems[i]];
      icons += elem.icon;
    }
    return icons;
  },
  
  compare : function(armor1, armor2){
    var diff = {};
    _.each(Armor.attributes, function(spec, name){
      var val1 = armor1[name], val2 = armor2[name];
      if (!_.isEqual(val1, val2)){
        diff[name] = [val1, val2];
      }
    });
    return diff;
  },
  
  getStats : function(armor, plus, level){
    var baseAtt, baseDef, stepAtt, stepDef;
    if (plus === true){
      baseAtt = armor.plusBaseAtt;
      baseDef = armor.plusBaseDef;
      stepAtt = armor.plusAttStep;
      stepDef = armor.plusDefStep;
    }else{
      baseAtt = armor.regBaseAtt;
      baseDef = armor.regBaseDef;
      stepAtt = armor.regAttStep;
      stepDef = armor.regDefStep;
    }
    var att = _.isNumber(baseAtt) ? baseAtt + ((level - 1) * stepAtt) : 0;
    var def = _.isNumber(baseDef) ? baseDef + ((level - 1) * stepDef) : 0;
    return {
      attack  : att,
      defense : def
    };
  },
  
  getPower : function(armor, plus, level){
    var stats = Armor.getStats(armor, plus, level);
    return stats.attack + stats.defense;
  }

};
