var roleManager = require("../services/rolemanager.js");

module.exports = function(req, res, ok){
  var error = function(){
    var requireOwnageError = [{
      name    : "requireOwnage",
      message : "You are not allowed",
      level   : "warning"
    }];
    req.session.flash = {err : requireOwnageError};
    res.redirect("/session/new");
  };
  if (!req.session.User) return error();
  var userId = req.param("id");
  if (userId == req.session.User.id){
    req.self = true;
    return ok();
  }
  roleManager.userAboveUser(req.session.User.id, userId, function(allowed){
    return allowed ? ok() : error();
  });
};