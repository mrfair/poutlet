var fs = require("fs");
var path = require("path");
var mime = require("mime-types");
var sass = require('sass');

module.exports = function () {

  var _create_file = function(file, outFile) {
    sass.render({
      file: file,
      outFile: outFile,
      outputStyle: 'compressed',
    }, function(err, result) {
      fs.writeFile(outFile, result.css, function(err){})
    });

  };

  var _render_css = function(folder_path) {
    if (fs.existsSync(folder_path) === true && fs.lstatSync(folder_path).isDirectory() === true) {
      fs.readdirSync(folder_path).forEach(
        (file_name) => { 
          if (fs.existsSync(folder_path) === true && fs.lstatSync(folder_path).isDirectory() === true) {
            _render_css(`${folder_path}/${file_name}`);
          }
          
          if(mime.lookup(file_name) === 'text/x-scss') {
            _create_file(`${folder_path}/${file_name}`, `${folder_path}/${file_name.replace(/.scss/g, '.css')}`);

            fs.watch(
              `${folder_path}/${file_name}`,
              function (event, filename) {
                _create_file(`${folder_path}/${file_name}`, `${folder_path}/${file_name.replace(/.scss/g, '.css')}`);
              }
            );
            //
          }
        })
    }
  }

  _render_css(path.resolve('poutlet_root'));
  _render_css(path.resolve('poutlet_plugin'));

  return;
};
