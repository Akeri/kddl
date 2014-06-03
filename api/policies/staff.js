
var roleManager = require("../services/rolemanager.js");

module.exports = function(req, res, ok){
    
  if (req.session.User && roleManager.userInGroup(req.session.User, "admin")) ok();
  else {
    var requireStaffLevelError = [{
      name    : "requireStaffLevel",
      message : "You must be part of the staff group to access this",
      level   : "warning"
    }];
    req.session.flash = {err : requireStaffLevelError};
    res.redirect("/session/new");
  }
    
};