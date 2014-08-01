var fs = require("fs");
var mkdirp = require("mkdirp");

module.exports = {
    
  uploadFile : function(file, dirPath, opts, cb, error){
    if (file.size > sails.config.kddl.maxUploadSize)
      error("File size cannot be bigger than " + (sails.config.kddl.maxUploadSize / 1000000) + "MB");
    var filePath = dirPath + "/" + file.name;
    var options = _.extend({
      mode      : 0755,
      enconding : "utf8",
      flag      : "w"
    }, opts);
    mkdirp.sync(dirPath, 0755);
    fs.writeFile(filePath, file.data, options, function(err){
      if (err) return error("Could not write file to storage");
      cb({
        name : file.name,
        path : filePath,
        size : file.size
      });
    });
  },
  
  uploadBase64 : function(file, dirPath, opts, cb, error){
    var regexp = /^data:image\/(png|gif|jpeg);base64,/;
    if (!file.data.search || file.data.search(regexp) == -1) return error("Selected resource is not a valid image file");
    var srcData = file.data;
    var data = srcData.replace(regexp, "");
    file.data = new Buffer(data, "base64");
    var options = _.extend({
      enconding : "base64"
    }, opts);
    this.uploadFile(file, dirPath, options, function(data){
      var sizeOf = require('image-size');
      var dims = sizeOf(data.path);
      if (dims.width != dims.height){
        fs.unlink(data.path);
        return error("Image must have same width and height");
      }
      data.data = srcData;
      cb(data);
    }, error);
  }
  
};