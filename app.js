// Start sails and pass it command line arguments
require('sails').lift(require('optimist').argv);

// To install a package updating package.json do: npm install <package> --save