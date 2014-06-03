var roleManager = require("../services/rolemanager.js");
var location    = require("../services/location.js");

/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    
  schema : true,
  
  types : {
    role : function(value){
      return roleManager.getRoleKeys().indexOf(value) != -1;
    }
  },

  attributes : {
  	
  	nickname : {
  	  type       : "string",
  	  required   : true,
  	  unique     : true
  	},
  	
  	email : {
  	  type     : "string",
	  email    : true,
	  required : true,
	  unique   : true
  	},
  	
  	status : {
  	  type   : "string"
  	},
  	
  	lineId : {
  	  type   : "string"
  	},
  	
  	role : {
  	  type       : "role",
  	  required   : true
  	},
  	
  	timezone : {
  	  type : "string"
  	},
  	
  	country : {
  	  type : "json"
  	},
  	
  	captions : {
  	  type       : "array"
  	},
  	
  	avatar : {
  	  type       : "string"
  	},
  	
  	encryptedPassword : {
      type : "string"
    },
    
    online : {
      type          : "boolean",
      defaultsTo    : false
    }
  },
  
  getAvatarPath : function(avatar){
    return avatar ? avatar : this.getRandomAvatarPath();
  },
  
  getRandomAvatarPath : function(){
    var fs = require("fs");
    var files = fs.readdirSync("assets/linker/images/default_avatars");
    var filename = files[Math.floor(Math.random() * files.length)];
    return "/linker/images/default_avatars/" + filename;
  },
  
  processPassword : function(values, next){
    // Check password validity
    if (!values.password.length) return next({err : [{
      name    : "InvalidPassword",
      message : "New password isn't valid"
    }]});
    if (values.password != values.passwordBis) return next({err : [{
      name    : "PasswordRewriteMismatch",
      message : "Password doesn't match password confirmation"
    }]});
    // Encrypt password
    require("bcrypt").hash(values.password, 10, function paswordEncrypted(err, encryptedPassword){
      if (err) return next(err);
      values.encryptedPassword = encryptedPassword;
      next();
    });
  },
  
  beforeValidation : function(values, next){
    // Process captions
    if (_.isString(values.captions)){
      var captions = [];
      values.captions = values.captions.split(",");
      _.each(values.captions, function(caption){
        if (caption != "") captions.push(caption.trim());
      });
      values.captions = captions;
    }
    // Process country
    if (_.isString(values.countryName) && _.isString(values.countryCCA2)){
      if (values.countryName == "") return next({
        err : [{
          name    : "EmptyCountryInput",
          message : "Country input is empty"
        }]
      });
      var countryNotFoundError = {
        err : [{
          name    : "CountryNotFound",
          message : "Couldn't find the country '" + values.countryName + "', use the selector"
        }]
      };
      if (values.countryCCA2 == "") return next(countryNotFoundError);
      var countryData = location.country.getByName(values.countryName);
      if (countryData == null) next(countryNotFoundError);
      values.country = {
        name : values.countryName,
        cca2 : values.countryCCA2
      };
      delete values.countryName;
      delete values.countryCCA2;
    }
    // Process timezone
    if (_.isString(values.timezone)){
      if (values.timezone == "null") return next({
        err : [{
          name    : "EmptyTimezoneInput",
          message : "You have to choose a timezone"
        }]
      });
    }
    next();
  },
  
  beforeCreate : function(values, next){
    // Set random avatar
    values.avatar = User.getRandomAvatarPath();
    // Process password
    User.processPassword(values, function(err){
      var errObj = err ? {
        ValidationError : {
          email : err.err
        }
      } : undefined;
      next(errObj);
    });
  },
  
  beforeUpdate : function(values, next){
    // Process password
    if (values.password) User.processPassword(values, function(err){
      var errObj = err ? {
        ValidationError : {
          email : err.err
        }
      } : undefined;
      next(errObj);
    });
    else next();
  }

};
