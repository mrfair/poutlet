var fs = require("fs");
var path = require("path");
var mime = require('mime-types')
var zlib = require("zlib");
var etag = require("etag");

module.exports = function() {
  var _poutlet_plugin = {};

  if(fs.existsSync(path.resolve('poutlet_plugin')) === true) {

    //Plugin folder
        
    var _plugin_folder = fs.readdirSync(path.resolve('poutlet_plugin'));
    _plugin_folder.forEach((plugin_name) => {

      var _plugin_name_folder = path.resolve(`poutlet_plugin/${plugin_name}`);

      try {
        

        if(fs.existsSync(`${_plugin_name_folder}/config.json`) === true) {
          var _plugin_name_config = JSON.parse(
            fs.readFileSync( `${_plugin_name_folder}/config.json`, { encoding: "utf8", flag: "r" })
          );

          var _poutlet_plugin_now = _poutlet_plugin[`${plugin_name}_${_plugin_name_config.hostname}`] = _plugin_name_config;
          
          if(fs.lstatSync(`${_plugin_name_folder}/method`).isDirectory()  === true) {
            _poutlet_plugin_now.method = {};

            fs.readdirSync(`${_plugin_name_folder}/method`).forEach((method_name) => {

              var _poutlet_plugin_now_method = _poutlet_plugin_now.method[method_name.toLowerCase()] = {
                //set up default root route
                '/' : {
                  headers: {},
                  body: function(request, response) {
                    response.send(`${request.poutlet.headers.method.toUpperCase()} : ${request.poutlet.headers.pathname} 200 OK`);
                  }
                }
              };

              
              fs.readdirSync(`${_plugin_name_folder}/method/${method_name}`).forEach((file_name) => {

                //Static folder
                if(file_name === 'static') {

                  fs.readdirSync(`${_plugin_name_folder}/method/${method_name}/static`).forEach((file_name_in_static) => {

                    zlib.gzip(fs.readFileSync(`${_plugin_name_folder}/method/${method_name}/static/${file_name_in_static}`, {encoding:'utf8', flag:'r'}), (err, buffer) => {
  
                      if (!err) { 
                        _poutlet_plugin_now_method[`/static/${file_name_in_static}`] = {
                          headers: {
                            "Content-Type" : mime.contentType(file_name_in_static),
                            "Cache-Control": "public, max-age=604800, immutable",
                            "content-length": buffer.length,
                            "content-encoding" : "gzip",
                            "ETag": etag(buffer)
                          },
                          body: buffer
                        }
                      } 
                      else {
                        console.log(err);
                      }
                    });

                    
                  });

                  

                } 
                //Other folder
                else if(fs.lstatSync(`${_plugin_name_folder}/method/${method_name}/${file_name}`).isDirectory()  === true) {

                } 
                //file
                else {


                  if(file_name !== 'middleware.js' && mime.lookup(file_name) === 'application/javascript') {
                    

                    var _file_name_to_path_name = file_name.split('.');

                    _file_name_to_path_name.pop();

                    _file_name_to_path_name = _file_name_to_path_name.join('.');

                    //If file name is 'root' set to /
                    if(_file_name_to_path_name === 'root') _file_name_to_path_name = ''; 

                    _poutlet_plugin_now_method[`/${_file_name_to_path_name}`] = {
                      headers: {
                        "Cache-Control": "no-cache"
                      },
                      body: function(request, response) {

                        if (fs.existsSync(`${_plugin_name_folder}/method/${method_name}/middleware.js`)) {
  
                          //Has middleware.js
  
                          require(`${_plugin_name_folder}/method/${method_name}/middleware.js`)(request, response);
                        }
  
                        require(`${_plugin_name_folder}/method/${method_name}/${file_name}`)(request, response);
                      }
                    }

                  }
                }
              });
            });
          }


        } else {
          throw new Error(`Config file not foud. Plugin : ${plugin_name} (poutlet_plugin/${plugin_name})`);
        }
      } catch(e) {
        console.log(`\u001b[31m${e.message}\u001b[37m`);
      }
       

    });
  }

  return _poutlet_plugin;
};