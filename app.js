// Start sails and pass it command line arguments
require('sails').lift(require('optimist').argv);

// To install a package updating package.json do:
//  npm install <package> --save

// To pull changes from remote repository:
//  git pull origin <branch>

// To pull overwriting local changes:
//  git fetch --all
//  git reset --hard origin/master

// To install new packages from package.json:
//  sudo npm install