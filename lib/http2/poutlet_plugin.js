var fs = require("fs");
var path = require("path");
var mime = require("mime-types");
var zlib = require("zlib");
var etag = require("etag");

module.exports = function (mode) {
  var _poutlet_plugin = {
    "/_*" : {
      method: {
        get: {}
      },
      hostname: "*",
    }
  };


  try {
    //Static folder
    var _static_folder_path = path.resolve("poutlet_static");

    if (mode === "build")
      _static_folder_path = path.resolve("poutlet_lib/poutlet_static");

    var _static_path_render = function (folder_path) {
      if (
        fs.existsSync(folder_path) === true &&
        fs.lstatSync(folder_path).isDirectory() === true
      ) {
        fs.readdirSync(folder_path).forEach((file_name) => {
          if(fs.lstatSync(`${folder_path}/${file_name}`).isDirectory() === true) {
            _static_path_render(`${folder_path}/${file_name}`);
          } else {

            var _static_path = folder_path.split('\\poutlet_static/')[1];

            if (
              mime
                .lookup(
                  `${folder_path}/${file_name}`
                )
                .indexOf("image") > -1
            ) {
              _poutlet_plugin["/_*"].method.get[`/static/${_static_path}/${file_name}`] = {
                headers: {
                  "Content-Type":
                    mime.contentType(file_name),
                  "Cache-Control":
                    "public, max-age=604800, immutable",
                  "content-length": fs.statSync(
                    `${folder_path}/${file_name}`
                  ).size,
                },
                body: function (request, response) {
                  fs.createReadStream(
                    `${folder_path}/${file_name}`
                  ).pipe(response);
                },
              };
            } else {
              _poutlet_plugin["/_*"].method.get[`/static/${_static_path}/${file_name}`] = {
                headers: {
                  "Content-Type":
                    mime.contentType(file_name),
                  "Cache-Control":
                    "public, max-age=604800, immutable",
                },
                body: function (request, response) {
                  zlib.gzip(
                    fs.readFileSync(
                      `${folder_path}/${file_name}`,
                      { encoding: "utf8", flag: "r" }
                    ),
                    (err, buffer) => {
                      if (err === null) {
                        response.setHeader(
                          "content-length",
                          buffer.length
                        );
                        response.setHeader(
                          "content-encoding",
                          "gzip"
                        );
                        response.setHeader(
                          "ETag",
                          etag(buffer)
                        );

                        response.end(buffer);
                      } else {
                        console.log(err)
                        fs.createReadStream(
                          `${folder_path}/${file_name}`
                        ).pipe(response);
                      }
                    }
                  );
                },
              };
            }

          }
        });
      }
    };

    _static_path_render(_static_folder_path);

    //Root folder
    var _root_folder_path = path.resolve("poutlet_root");

    if (mode === "build")
      _root_folder_path = path.resolve("poutlet_lib/poutlet_root");

    if (
      fs.existsSync(_root_folder_path) === true &&
      fs.existsSync(`${_root_folder_path}/method`) === true
    ) {
      

      fs.readdirSync(_root_folder_path + "/method").forEach((method_name) => {
        if(!_poutlet_plugin["/_*"].method[method_name]) _poutlet_plugin["/_*"].method[method_name] = {};

        if (
          fs.existsSync(`${_root_folder_path}/method/${method_name}`) ===
            true &&
          fs
            .lstatSync(`${_root_folder_path}/method/${method_name}`)
            .isDirectory() === true
        ) {
          if (
            fs.existsSync(`${_root_folder_path}/method/${method_name}/root.js`)
          ) {
            if (!_poutlet_plugin["/_*"].method[method_name]["/"])
              _poutlet_plugin["/_*"].method[method_name]["/"] = {};

            _poutlet_plugin["/_*"].method[method_name]["/"].headers = {
              "Cache-Control": "no-cache",
            };

            _poutlet_plugin["/_*"].method[method_name][
              "/"
            ].body = require(`${_root_folder_path}/method/${method_name}/root.js`);

            if (
              fs.existsSync(
                `${_root_folder_path}/method/${method_name}/root.css`
              )
            ) {
              _poutlet_plugin["/_*"].method[method_name]["/"].css =
                fs.readFileSync(
                  `${_root_folder_path}/method/${method_name}/root.css`,
                  {
                    encoding: "utf8",
                    flag: "r",
                  }
                );
            }
          }
        }
      });
    }

    //Plugin folder
    var _plugin_folder_path = path.resolve("poutlet_plugin");

    if (mode === "build")
      _plugin_folder_path = path.resolve("poutlet_lib/poutlet_plugin");

    if (fs.existsSync(_plugin_folder_path) === true) {
      //Plugin folder
      fs.readdirSync(_plugin_folder_path).forEach((plugin_name) => {
        var _plugin_name_folder = _plugin_folder_path + `/${plugin_name}`;

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
                  if (!prefix_name) prefix_name = "";

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
                            if (
                              mime
                                .lookup(
                                  `${path_dir}/${name_of_dir_in_staic}/${file_name_in_static}`
                                )
                                .indexOf("image") > -1
                            ) {
                              _poutlet_plugin_now_method[
                                `/${plugin_name}/${name_of_dir_in_staic}/${file_name_in_static}`
                              ] = {
                                headers: {
                                  "Content-Type":
                                    mime.contentType(file_name_in_static),
                                  "Cache-Control":
                                    "public, max-age=604800, immutable",
                                  "content-length": fs.statSync(
                                    `${path_dir}/${name_of_dir_in_staic}/${file_name_in_static}`
                                  ).size,
                                },
                                body: function (request, response) {
                                  fs.createReadStream(
                                    `${path_dir}/${name_of_dir_in_staic}/${file_name_in_static}`
                                  ).pipe(response);
                                },
                              };
                            } else {
                              _poutlet_plugin_now_method[
                                `/${plugin_name}/${name_of_dir_in_staic}/${file_name_in_static}`
                              ] = {
                                headers: {
                                  "Content-Type":
                                    mime.contentType(file_name_in_static),
                                  "Cache-Control":
                                    "public, max-age=604800, immutable",
                                },
                                body: function (request, response) {
                                  zlib.gzip(
                                    fs.readFileSync(
                                      `${path_dir}/${name_of_dir_in_staic}/${file_name_in_static}`,
                                      { encoding: "utf8", flag: "r" }
                                    ),
                                    (err, buffer) => {
                                      if (err === null) {
                                        response.setHeader(
                                          "content-length",
                                          buffer.length
                                        );
                                        response.setHeader(
                                          "content-encoding",
                                          "gzip"
                                        );
                                        response.setHeader(
                                          "ETag",
                                          etag(buffer)
                                        );

                                        response.end(buffer);
                                      } else {
                                        console.log(err)
                                        fs.createReadStream(
                                          `${path_dir}/${name_of_dir_in_staic}/${file_name_in_static}`
                                        ).pipe(response);
                                      }
                                    }
                                  );
                                },
                              };
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
                      var _file_name_to_path_name = file_name.split(".");

                      _file_name_to_path_name.pop();

                      _file_name_to_path_name =
                        "/" + _file_name_to_path_name.join(".");

                      if (_file_name_to_path_name === "/root")
                        _file_name_to_path_name = "";

                      if (
                        file_name !== "middleware.js" &&
                        mime.lookup(file_name) === "application/javascript"
                      ) {
                        if (
                          !_poutlet_plugin_now_method[
                            `/${plugin_name}${prefix_name}${_file_name_to_path_name}`
                          ]
                        )
                          _poutlet_plugin_now_method[
                            `/${plugin_name}${prefix_name}${_file_name_to_path_name}`
                          ] = {};

                        _poutlet_plugin_now_method[
                          `/${plugin_name}${prefix_name}${_file_name_to_path_name}`
                        ].headers = {
                          "Cache-Control": "no-cache",
                        };

                        _poutlet_plugin_now_method[
                          `/${plugin_name}${prefix_name}${_file_name_to_path_name}`
                        ].body = async function (request, response) {
                          if (fs.existsSync(`${path_dir}/middleware.js`)) {
                            //Has middleware.js
                            var _middleware = require(`${path_dir}/middleware.js`);

                            if (typeof _middleware === "function")
                              await _middleware(request, response);
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
                        };
                      } else if (mime.lookup(file_name) === "text/css") {
                        if (
                          !_poutlet_plugin_now_method[
                            `/${plugin_name}${prefix_name}${_file_name_to_path_name}`
                          ]
                        )
                          _poutlet_plugin_now_method[
                            `/${plugin_name}${prefix_name}${_file_name_to_path_name}`
                          ] = {};

                        if (
                          !_poutlet_plugin_now_method[
                            `/${plugin_name}${prefix_name}${_file_name_to_path_name}`
                          ].css
                        )
                          _poutlet_plugin_now_method[
                            `/${plugin_name}${prefix_name}${_file_name_to_path_name}`
                          ].css = "";

                        _poutlet_plugin_now_method[
                          `/${plugin_name}${prefix_name}${_file_name_to_path_name}`
                        ].css += fs.readFileSync(`${path_dir}/${file_name}`, {
                          encoding: "utf8",
                          flag: "r",
                        });
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
