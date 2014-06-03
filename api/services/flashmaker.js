module.exports = {
    
  errTypes : ["ValidationError", "MongoError"],
  
  from : function(data){
    console.log(data);
    switch(true){
      case data.ValidationError != undefined:
        return this.fromValidationError(data);
      case data.name && data.name == "MongoError":
        return this.fromMongoError(data);
      default: return data;
    }
  },

  fromValidationError : function(data){
    var errs = [];
    _.each(data.ValidationError, function(fieldErrs, field){
      _.each(fieldErrs, function(errObj){
        errs.push({
          message : (function(){
            switch(errObj.rule){
              case "email"      : return "You must type a valid e-mail address";
              case "required"   : return "You forgot fill '" + field + "'";
              default           : return errObj.message;
            }
          })()
        });
      });
    });
    console.log(errs);
    return {err : errs};
  },
  
  fromMongoError : function(data){
    return { err : [(function(){
      switch(data.code){
      case 11000:
        var regexp = /.+\: \w+\.(\w+)\.\$(\w+)_\d+\s+dup key\: \{.*\:\s*"(.+)"\s*\}/;
        var match = regexp.exec(data.err);
        return {
          level     : "warning",
          message   : "The " + match[2] + " '" + match[3] + "' already exists"
        };
      }
    })()]};
  }
  
};