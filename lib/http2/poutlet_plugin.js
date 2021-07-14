var fs = require("fs");
var path = require("path");
var mime = require("mime-types");
var zlib = require("zlib");
var etag = require("etag");

module.exports = function () {
  var _poutlet_plugin = {};

  try {
    //Root folder
    if (fs.existsSync(path.resolve("poutlet_root")) === true) {
      _poutlet_plugin["/_*"] = {
        method: {},
        hostname: "*"
      };

      fs.readdirSync(path.resolve("poutlet_root")).forEach((method_name) => {
        _poutlet_plugin["/_*"].method[method_name] = {};

        if (
          fs.existsSync(path.resolve(`poutlet_root/${method_name}`)) === true &&
          fs
            .lstatSync(path.resolve(`poutlet_root/${method_name}`))
            .isDirectory() === true
        ) {
          if (
            fs.existsSync(path.resolve(`poutlet_root/${method_name}/root.js`))
          ) {
            _poutlet_plugin["/_*"].method[method_name]["/"] = {
              headers: {
                "Cache-Control": "no-cache",
              },
              body: require(path.resolve(
                `poutlet_root/${method_name}/root.js`
              )),
              css: ''
            };

            //CSS
            fs.readdirSync(path.resolve(`poutlet_root/${method_name}`)).forEach((file_name) => {
              if(mime.lookup(path.resolve(`poutlet_root/${method_name}/${file_name}`)) === 'text/css') {
                _poutlet_plugin["/_*"].method[method_name]["/"].css += fs.readFileSync(path.resolve(`poutlet_root/${method_name}/${file_name}`), {
                  encoding: "utf8",
                  flag: "r",
                });
              }
            });
          }
        }

        
        
      });


    }

    //Plugin folder
    if (fs.existsSync(path.resolve("poutlet_plugin")) === true) {
      //Plugin folder
      var _plugin_folder = fs.readdirSync(path.resolve("poutlet_plugin"));
      _plugin_folder.forEach((plugin_name) => {
        var _plugin_name_folder = path.resolve(`poutlet_plugin/${plugin_name}`);

        if (fs.existsSync(`${_plugin_name_folder}/config.json`) === true) {
          var _plugin_name_config = JSON.parse(
            fs.readFileSync(`${_plugin_name_folder}/config.json`, {
              encoding: "utf8",
              flag: "r",
            })
          );

          var _poutlet_plugin_now = (_poutlet_plugin[
            `/${plugin_name}_${_plugin_name_config.hostname}`
          ] = _plugin_name_config);

          if (
            fs.existsSync(`${_plugin_name_folder}/method`) === true &&
            fs.lstatSync(`${_plugin_name_folder}/method`).isDirectory() === true
          ) {
            _poutlet_plugin_now.method = {};

            fs.readdirSync(`${_plugin_name_folder}/method`).forEach(
              (method_name) => {
                var _poutlet_plugin_now_method = (_poutlet_plugin_now.method[
                  method_name.toLowerCase()
                ] = {});

                var read_path_to_plugin = function (path_dir, prefix_name) {
                  fs.readdirSync(path_dir).forEach((file_name) => {
                    //Static folder
                    if (
                      file_name === "static" &&
                      fs.lstatSync(`${path_dir}/${file_name}`).isDirectory() ===
                        true
                    ) {
                      var _plugin_render_for_static = function (
                        name_of_dir_in_staic
                      ) {
                        fs.readdirSync(
                          `${path_dir}/${name_of_dir_in_staic}`
                        ).forEach((file_name_in_static) => {
                          if (
                            fs
                              .lstatSync(
                                `${path_dir}/${name_of_dir_in_staic}/${file_name_in_static}`
                              )
                              .isDirectory() === true
                          ) {
                            _plugin_render_for_static(
                              `${name_of_dir_in_staic}/${file_name_in_static}`
                            );
                          } else {

                            if(mime.lookup(`${path_dir}/${name_of_dir_in_staic}/${file_name_in_static}`).indexOf('image') > -1) {
                              _poutlet_plugin_now_method[
                                `/${plugin_name}/${name_of_dir_in_staic}/${file_name_in_static}`
                              ] = {
                                headers: {
                                  "Content-Type":
                                    mime.contentType(file_name_in_static),
                                  "Cache-Control":
                                    "public, max-age=604800, immutable",
                                    "content-length": fs.statSync(`${path_dir}/${name_of_dir_in_staic}/${file_name_in_static}`).size,
                                },
                                body: function(request, response) {
                                  fs.createReadStream(`${path_dir}/${name_of_dir_in_staic}/${file_name_in_static}`).pipe(response);
                                },
                              };

                            } else {

                              zlib.gzip(
                                fs.readFileSync(
                                  `${path_dir}/${name_of_dir_in_staic}/${file_name_in_static}`,
                                  { encoding: "utf8", flag: "r" }
                                ),
                                (err, buffer) => {
                                  if (err === null) {
                                    _poutlet_plugin_now_method[
                                      `/${plugin_name}/${name_of_dir_in_staic}/${file_name_in_static}`
                                    ] = {
                                      headers: {
                                        "Content-Type":
                                          mime.contentType(file_name_in_static),
                                        "Cache-Control":
                                          "public, max-age=604800, immutable",
                                        "content-length": buffer.length,
                                        "content-encoding": "gzip",
                                        ETag: etag(buffer),
                                      },
                                      body: buffer,
                                    };
                                  } else {
                                    console.log(err);
                                  }
                                }
                              );
                            }
                            
                          }
                        });
                      };

                      _plugin_render_for_static(`static`);
                    }

                    //Other folder
                    else if (
                      fs.lstatSync(`${path_dir}/${file_name}`).isDirectory() ===
                      true
                    ) {
                      read_path_to_plugin(
                        `${path_dir}/${file_name}`,
                        `${prefix_name}/${file_name}`
                      );
                    }

                    //file
                    else {
                      if (
                        file_name !== "middleware.js" &&
                        mime.lookup(file_name) === "application/javascript"
                      ) {
                        var _file_name_to_path_name = file_name.split(".");

                        _file_name_to_path_name.pop();

                        _file_name_to_path_name =
                          "/" + _file_name_to_path_name.join(".");

                        if (_file_name_to_path_name === "/root")
                          _file_name_to_path_name = "";

                        _poutlet_plugin_now_method[
                          `/${plugin_name}${prefix_name}${_file_name_to_path_name}`
                        ] = {
                          headers: {
                            "Cache-Control": "no-cache",
                          },
                          body: function (request, response) {
                            if (fs.existsSync(`${path_dir}/middleware.js`)) {
                              //Has middleware.js
                              var _middleware = require(`${path_dir}/middleware.js`);

                              if (typeof _middleware === "function")
                                _middleware(request, response);
                            }

                            var _plugin_response = require(`${path_dir}/${file_name}`);

                            if (typeof _plugin_response === "function")
                              _plugin_response(request, response);
                            else {
                              response.writeHead(502);
                              response.end(
                                "502 - No function to support http response."
                              );
                            }
                          },
                        };
                      }
                    }
                  });
                };

                read_path_to_plugin(
                  `${_plugin_name_folder}/method/${method_name}`,
                  ""
                );
              }
            );
          }
        } else {
          throw new Error(
            `Config file not foud. Plugin : ${plugin_name} (poutlet_plugin/${plugin_name})`
          );
        }
      });
    }
  } catch (e) {
    console.log(`\u001b[31m${e.message}\u001b[37m`);
  }

  return _poutlet_plugin;
};
