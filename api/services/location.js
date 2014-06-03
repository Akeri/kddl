var fs   = require("fs");
var path = require("path");

module.exports = {
  
  country : {
    
    filePath : path.join(process.cwd(), "assets/data/countries.json"),
    
    collection : null,
    
    getCollection : function(){
      if (this.collection == null){
        var content = fs.readFileSync(this.filePath, "utf8");
        this.collection = JSON.parse(content);
      }
      return this.collection;
    },
    
    getByName : function(name){
      var collection = this.getCollection();
      var country = null;
      collection.every(function(_country){
        if (_country.name.toLowerCase() != name.toLowerCase()) return true;
        country = _country;
      });
      return country;
    }
    
  }
  
};