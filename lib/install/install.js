var path = require('path');
var fs = require('fs');

module.exports = function() {
  
  if(fs.existsSync(path.resolve('poutlet_plugin')) !== true) {
    fs.mkdir(path.resolve('poutlet_plugin'), function(err) {
    })
  }

  if(fs.existsSync(path.resolve('poutlet_static')) !== true) {
    fs.mkdir(path.resolve('poutlet_static'), function(err) {
    })
  }
  
  return true;
};