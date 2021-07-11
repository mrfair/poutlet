var fs = require("fs");
var path = require("path");

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

          var __poutlet_plugin_now = _poutlet_plugin[`${plugin_name}_${_plugin_name_config.hostname}`] = _plugin_name_config;
          
          if(fs.lstatSync(`${_plugin_name_folder}/method`).isDirectory()  === true) {
            __poutlet_plugin_now.method = {};

            fs.readdirSync(`${_plugin_name_folder}/method`).forEach((method_name) => {
              __poutlet_plugin_now.method[method_name] = {};

              
              fs.readdirSync(`${_plugin_name_folder}/method/${method_name}`).forEach((file_name) => {

                

                if(fs.lstatSync(`${_plugin_name_folder}/method/${method_name}/${file_name}`).isDirectory()  === true) {

                } else {

                  var _path_of_file_name = file_name.split('.');

                  _path_of_file_name.pop();

                  _path_of_file_name = _path_of_file_name.join('.');

                  if(file_name !== 'middleware.js') {


                    

                    __poutlet_plugin_now.method[method_name][_path_of_file_name] = function(request, response) {

                      if (fs.existsSync(`${_plugin_name_folder}/method/${method_name}/middleware.js`)) {

                        //Has middleware.js

                        require(`${_plugin_name_folder}/method/${method_name}/middleware.js`)(request, response);
                      }

                      require(`${_plugin_name_folder}/method/${method_name}/${file_name}`)(request, response);
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