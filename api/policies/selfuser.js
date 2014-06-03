
module.exports = function(req, res, ok){
//  console.log(req.param("id"), req.param("_allowToUserId_"), req.session.User.id);
  if (req.session.User && (req.param("userId") == req.session.User.id)) ok();
  else {
    var requireOwnageError = [{
      name    : "requireOwnage",
      message : "You are not allowed",
      level   : "warning"
    }];
    req.session.flash = {err : requireOwnageError};
    res.redirect("/session/new");
  }
    
};