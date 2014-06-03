/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  
  // set offline status to all users
  User.update({}, { online : false }, function(err, users){
    if (err) console.log(err);
    
    // make symlinks
    var fs = require("fs");
    var path = require("path");
    fs.symlink(
      path.join(process.cwd(), "/files/images/armors"),
      path.join(process.cwd(), "/.tmp/public/linker/images/armors"),
      function(err){ if (err) console.log(err); }
    );

    cb();
  });
};