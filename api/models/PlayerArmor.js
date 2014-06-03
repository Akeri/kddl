/**
 * PlayerArmor
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
  	armorId : {
  	  type     : "string",
  	  required : true
  	},
  	
  	playerId : {
  	  type     : "string",
  	  required : true
  	},
  	
  	level : {
  	  type     : "integer",
  	  required : true,
  	  min      : 1
  	},
  	
  	plus : {
  	  type       : "boolean",
  	  defaultsTo : false
  	},
  	
  	fused : {
	  type       : "date",
  	  defaultsTo : null
  	}
    
  },
  
  beforeValidation : function(values, next){
    // Process plus
    if (_.isString(values.plus)) values.plus = values.plus == "on";
    next();
  }

};
