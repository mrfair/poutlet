var http = require("http");
var http2 = require("http2");
var fs = require("fs");
var poutlet_plugin = require("poutlet/lib/http2/poutlet_plugin")();

module.exports = function (config_http2) {
  try {
  //console.log(poutlet_plugin)

  //Poutlet plugin
  http2
    .createSecureServer(
      {
        key: fs.readFileSync(config_http2.key_path),
        cert: fs.readFileSync(config_http2.cert_path),
      },
      (request, response) => {
        //Set up response
        response.setHeader("Contype-Type", "text/html; charset=utf-8");
        response.setHeader(
          "Cache-Control",
          "public, max-age=604800, immutable"
        );

        response.body = "";
        response.body += require("../live_reload/client_script.js")(
          config_http2
        );

        response.send = function (data) {
          response.end(response.body + data);
        };

        response.json = function(data) {
          response.setHeader("Contype-Type", "application/json");
          response.end(data);
        }

        request.poutlet = {
          headers: require("./poutlet_headers.js")(request, config_http2),
        };

        //console.log(request.poutlet);

        //console.log(poutlet_plugin);

        var _request_poutlet_plugin = null;

        if (
          poutlet_plugin[`${request.poutlet.headers.path_key}_`] !== undefined
        ) {
          _request_poutlet_plugin =
            poutlet_plugin[`${request.poutlet.headers.path_key}_`];
        } else {
          var _hostname_valid = ["*"];

          var _hostname = "";

          var _hostname_split = request.poutlet.headers.hostname.split(".");

          _hostname_split.forEach(function (sub, index) {
            if (index < _hostname_split.length - 1) {
              _hostname += sub + ".";

              _hostname_valid.push(_hostname + "*");
            }
          });

          _hostname_valid.push(request.poutlet.headers.hostname);

          for (var i = _hostname_valid.length; i-- > 0; ) {
            //console.log(`${request.poutlet.headers.path_key}_${_hostname_valid[i]}`);

            if (
              poutlet_plugin[
                `${request.poutlet.headers.path_key}_${_hostname_valid[i]}`
              ] !== undefined
            ) {
              _request_poutlet_plugin =
                poutlet_plugin[
                  `${request.poutlet.headers.path_key}_${_hostname_valid[i]}`
                ];

              break;
            }
          }

          //console.log(_request_poutlet_plugin, request.poutlet.headers)

          if (_request_poutlet_plugin === null) {
            response.writeHead(404);

            response.end();
          } else {
            if (
              _request_poutlet_plugin.method[request.poutlet.headers.method] &&
              _request_poutlet_plugin.method[request.poutlet.headers.method][
                request.poutlet.headers.pathname
              ]
            ) {
              //Update response headers
              for (var i in _request_poutlet_plugin.method[
                request.poutlet.headers.method
              ][request.poutlet.headers.pathname].headers) {
                response.setHeader(
                  i,
                  _request_poutlet_plugin.method[
                    request.poutlet.headers.method
                  ][request.poutlet.headers.pathname].headers[i]
                );
              }

              if (
                typeof _request_poutlet_plugin.method[
                  request.poutlet.headers.method
                ][request.poutlet.headers.pathname].body === "function"
              ) {
                _request_poutlet_plugin.method[request.poutlet.headers.method][
                  request.poutlet.headers.pathname
                ].body(request, response);
              } else {
                response.end(
                  _request_poutlet_plugin.method[
                    request.poutlet.headers.method
                  ][request.poutlet.headers.pathname].body
                );
              }
            } else {
              response.writeHead(404);

              response.end();
            }
          }
        }

        return true;
      }
    )
    .listen(config_http2.port_dev)
    .setTimeout(config_http2.server_timeout);

  //Api ui
  http2
    .createSecureServer(
      {
        key: fs.readFileSync(config_http2.key_path),
        cert: fs.readFileSync(config_http2.cert_path),
      },
      (request, response) => {
        response.setHeader("Contype-Type", "text/html; charset=utf-8");
        response.setHeader("Contype-Control", "no-cache");

        response.end(`<!DOCTYPE html>
          <html ⚡ lang="en">
            <head>
              <meta charset="utf-8" />
            </head>
            <body>
                <code id="json" style="white-space: pre">${JSON.stringify(poutlet_plugin)}</code>
                <script>
                console.log(${JSON.stringify(poutlet_plugin)})
                </script>
            </body>
          </html>`);
      }
    )
    .listen(config_http2.port_ui_api)
    .setTimeout(config_http2.server_timeout);

  //Http
  http
    .createServer(function (request, response) {
      res.writeHead(301, {
        location: `https://${config_http2.hostname}:${config_http2.port_dev}`,
      });
      res.end();

      return true;
    })
    .listen(80)
    .setTimeout(config_http2.server_timeout);

  }
  catch(e) {
    console.log(e);
  }

  return true;
};
