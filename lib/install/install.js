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

  if(fs.existsSync(path.resolve('poutlet_root')) !== true) {
    fs.mkdirSync(path.resolve('poutlet_root'));

    fs.mkdirSync(path.resolve('poutlet_root/get'));

    fs.writeFileSync(path.resolve('poutlet_root/get/root.js'), `module.exports = function(request, response) { response.send(\`<!DOCTYPE html><html ⚡ lang="en"><head><meta charset="utf-8" /></head><body>Poutlet Root</body></html>\`); };`);

    fs.mkdirSync(path.resolve('poutlet_root/post'));
    
    fs.writeFileSync(path.resolve('poutlet_root/post/root.js'), `module.exports = function(request, response) { response.json({status: 200, responseText: "OK"}); };`);
  }
  
  return true;
};