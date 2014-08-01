/**
 * SessionController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
   
  // render login
  "new" : function(req, res){
    res.view("session/new");
  },
  
  // perform login operation
  create : function(req, res, next){
    // check for email and password in params sent via the formn, if none
    // redirect the browser back to sign-in form
    if (!req.param("email") || !req.param("password")){
      var emailPasswordRequiredError = [{
        name    : "emailPasswordRequired",
        message : "You must enter both the email address and password"
      }];
      // remember that err is the object being passed down (a.k.a. flash.err), whose value is another object with
      // the key of emailPasswordRequiredError
      req.session.flash = {err : emailPasswordRequiredError};
      res.redirect("/session/new");
      return;
    }
    // try to find the user by there email address
    // findOneByEmail() is a dynamic finder in that it searches the model by a particular attribute
    User.findOneByEmail(req.param("email"), function foundUser(err, user){
      if (err) return next(err);
      // if no user is found
      if (!user){
        var noAccountError = [{
          name  : "noAccount",
          message   : req.param("email") + " not found"
        }];
        req.session.flash = {err : noAccountError};
        res.redirect("/session/new");
        return;
      }
      // compare password from the form params to the encrypted password of the user found
      require("bcrypt").compare(req.param("password"), user.encryptedPassword, function(err, valid){
        if (err) return next(err);
        // if the pasword from the form doesn't match the password from the database...
        if (!valid){
          var emailPasswordMismatchError = [{
            name      : "emailPasswordMismatch",
            message   : "Access denied"
          }];
          req.session.flash = {err : emailPasswordMismatchError};
          res.redirect("/session/new");
          return;
        }
        // log user in
        req.session.authenticated = true;
        req.session.User = user;
        // change status to online
        user.online = true;
        user.save(function saved(err, user){
          if (err) return;
          // inform other connected and subscribed sockets that this user is now logged in
          User.publishUpdate(user.id, {
            id      : user.id,
            online  : true
          });
        });
//        res.redirect("/guild/show");
        // redirect to their profile page
        res.redirect("/user/profile/" + user.id);
//        res.redirect("/user/profile/" + user.id + "/edit");
//        res.redirect("/user/profile/" + user.id);
//        res.redirect("/armor/inspectpage");
//        res.redirect("/user/profile/" + user.id + "/edit/#user-players");
//        res.redirect("/user/profile/" + user.id + "/edit");
//        res.redirect("/user/" + user.id + "/player/new");
//        res.redirect("/user");
//        res.redirect("/guild/show/" + sails.config.kddl.mainGuildId);
//        res.redirect("/guild/edit/" + sails.config.kddl.mainGuildId);
      });
    });
  },
  
  // perform log out operation
  destroy : function(req, res, next){
    var userId = req.session.User.id;
    User.update(userId, {
      online : false
    }, function(err){
      if (err) return;
      User.publishUpdate(userId, {
        id      : userId,
        online  : false
      });
    });
    // wipe out the session (log out)
    req.session.destroy();
    // redirect the browser to the sign-in screen
    res.redirect("/");
  }
  
};
