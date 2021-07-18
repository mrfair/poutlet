var WebSocketServer = require("websocket").server;
var http = require("http");
var fs = require("fs");
var path = require("path");
var mime = require("mime-types");

module.exports = function (config_http2) {
  wsServer = new WebSocketServer({
    autoAcceptConnections: false,
    httpServer: http
      .createServer(function (request, response) {
        response.writeHead(404);
        response.end();
      })
      .listen(config_http2.port_live_reload),
  });

  wsServer.on("request", function (request) {
    var connection = request.accept("livereload-protocol", request.origin);

    connection.sendUTF(
      JSON.stringify({
        type: "start",
        body: "Live reload start : " + new Date(),
      })
    );

    //Global css
    if (fs.existsSync(path.resolve("poutlet_root/global.css")) === true) 
    fs.watch(
      path.resolve("poutlet_root/global.css"),
      function (event, filename) {
        if (mime.lookup(filename) === "text/css") {
          connection.sendUTF(
            JSON.stringify({
              type: "css",
              element: "poutlet-css-global",
              body: fs.readFileSync(path.resolve("poutlet_root/global.css"), {
                encoding: "utf8",
                flag: "r",
              }),
            })
          );
        }
      }
    );

    //Root css
    if (fs.existsSync(path.resolve("poutlet_root/method/get/root.css")) === true) 
    fs.watch(
      path.resolve("poutlet_root/method/get/root.css"),
      function (event, filename) {
        if (mime.lookup(filename) === "text/css") {
          connection.sendUTF(
            JSON.stringify({
              type: "css",
              element: "poutlet-css-local",
              pathname: "/",
              body: fs.readFileSync(path.resolve("poutlet_root/method/get/root.css"), {
                encoding: "utf8",
                flag: "r",
              }),
            })
          );
        }
      }
    );

    //Plugin folder
    if (fs.existsSync(path.resolve("poutlet_plugin")) === true) {
      //Plugin folder
      var _plugin_folder = fs.readdirSync(path.resolve("poutlet_plugin"));
      _plugin_folder.forEach((plugin_name) => {
        var _plugin_name_folder = path.resolve(`poutlet_plugin/${plugin_name}`);

        if (fs.existsSync(`${_plugin_name_folder}/method`) === true) 
          fs.readdirSync(`${_plugin_name_folder}/method`).forEach(
            (method_name) => {
              var read_path_to_plugin = function (path_dir, prefix_name) {
                if (!prefix_name) prefix_name = "";

                fs.readdirSync(path_dir).forEach((file_name) => {
                  //Static folder
                  if (
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
                    if (mime.lookup(file_name) === "text/css") {
                      var _file_name_to_path_name = file_name.split(".");

                      _file_name_to_path_name.pop();

                      _file_name_to_path_name =
                        "/" + _file_name_to_path_name.join(".");

                      if (_file_name_to_path_name === "/root")
                        _file_name_to_path_name = "";

                      //Plugin css
                      if (fs.existsSync(`${path_dir}/${file_name}`) === true)
                      fs.watch(
                        `${path_dir}/${file_name}`,
                        function (event, filename) {
                          if (mime.lookup(filename) === "text/css") {
                            connection.sendUTF(
                              JSON.stringify({
                                type: "css",
                                element: "poutlet-css-local",
                                pathname: `/${plugin_name}${prefix_name}${_file_name_to_path_name}`,
                                body: fs.readFileSync(
                                  `${path_dir}/${file_name}`,
                                  {
                                    encoding: "utf8",
                                    flag: "r",
                                  }
                                ),
                              })
                            );
                          }
                        }
                      );
                      //
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
      });
    }
  });

  setTimeout(function () {
    if (wsServer.connections.length === 0)
      require("open")(
        `https://${config_http2.hostname_dev}:${config_http2.port_dev}`
      );
  }, 500);

  return true;
};
