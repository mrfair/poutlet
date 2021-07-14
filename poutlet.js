var path = require('path');
var nodemon = require('nodemon');

module.exports = function() {
  nodemon({
    script: __dirname + '/start.js',
    ext: 'js json html',
    watch: [__dirname , path.resolve('poutlet_static'), path.resolve('poutlet_root'), path.resolve('poutlet_plugin'), ],
    ignoreRoot: [".git", __dirname+'/node_modules']
  });
  
  nodemon.on('start', function () {
    console.log('App has started');
  }).on('quit', function () {
    console.log('App has quit');
    process.exit();
  }).on('restart', function (files) {
    console.log('App restarted due to: ', files);
  });
};