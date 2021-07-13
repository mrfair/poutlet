var http2 = require("http2");
var fs = require("fs");
var poutlet_plugin = require("poutlet/lib/http2/poutlet_plugin")();
var zlib = require("zlib");
var etag = require("etag");

module.exports = function (config_http2) {
  try {
  //console.log(poutlet_plugin)
  
  //Set up development static file
  var poutlet_dev_static = {
    '/poutlet_dev_static/live_reload.js': {
      headers: {
        "Contype-Type" : "text/javascript"
      },
      body: require('../live_reload/client_script.js')(config_http2)
    }
  };

  //Poutlet plugin
  http2
    .createSecureServer(
      {
        key: fs.readFileSync(config_http2.key_path),
        cert: fs.readFileSync(config_http2.cert_path),
      },
      (request, response) => {


        //Setup request

        request.poutlet = {
          headers: require("./poutlet_headers.js")(request, config_http2),
        };

        if(Array.isArray(config_http2.access_control_allow_origin_dev)=== true && config_http2.access_control_allow_origin_dev.length > 0 && (config_http2.access_control_allow_origin_dev.indexOf('*') > -1 || config_http2.access_control_allow_origin_dev.indexOf(request.poutlet.headers.origin) > -1 )) {
          response.setHeader('Access-Control-Allow-Origin', request.poutlet.headers.origin );

        }

        //End setup request

        
        //Set up response
        response.setHeader("Contype-Type", "text/html; charset=utf-8");
        response.setHeader("Cache-Control", "public, max-age=604800, immutable");

        response.send = function (data) {
          zlib.gzip(data, (err, buffer) => {
            if (err === null) {
              response.setHeader("content-length", buffer.length);
              response.setHeader("content-encoding", "gzip");
              response.setHeader("ETag", etag(buffer));
              response.end(buffer);
            } 
            else {
              console.log(err);
            }
          });

          return;
        };

        response.json = function(data) {
          response.setHeader("Contype-Type", "application/json");
          response.send(JSON.stringify(data));

          return;
        }

        response.html = function(body, config) {

          if(!config) config = {};

          response.setHeader("Contype-Type", "text/html; charset=utf-8");

          var _static = config_http2.response_html && Array.isArray(config_http2.response_html.static) === true ? config_http2.response_html.static : [];

          if(Array.isArray(config.static) === true) _static = _static.concat(config.static);

          //if dev mode
          _static = _static.concat([
            {
              link: '/poutlet_dev_static/live_reload.js',
              as: "script",
              async: true,
            }
          ]);
          //

          response.send(`<!DOCTYPE html>
          <html ⚡ lang="en">
            <head>
              <meta charset="utf-8" />
              ${_static
                .map(function (v) {
                  return `<link rel="preload" href="${
                    v.link
                  }" as="${v.as}" ${v.integrity !== undefined ? `integrity="${v.integrity}"` : ""} ${v.crossorigin !== undefined ? `crossorigin="${v.crossorigin}"` : ""}>`;
                })
                .join("")}
            </head>
            <body>
              ${body}
              ${_static
                .map(function (v) {
                  if (v.as === "script") {
                    return `<script type="text/javascript" ${
                      v.async === true ? `async="async"` : ""
                    } ${v.defer === true ? `defer="defer"` : ""} ${
                      v.integrity ? `integrity="${v.integrity}"` : ""
                    } ${
                      v.crossorigin ? `crossorigin="${v.crossorigin}"` : ""
                    } src="${v.link}" ${v.referrerpolicy ? `referrerpolicy="${v.referrerpolicy}"` : ''}></script>`;
                  } else if (v.as === "style") {
                    return `<link rel="stylesheet" href="${v.link}" ${
                      v.integrity ? `integrity="${v.integrity}"` : ""
                    } ${v.crossorigin ? `crossorigin="${v.crossorigin}"` : ""} ${v.referrerpolicy ? `referrerpolicy="${v.referrerpolicy}"` : ''} />`;
                  }
                })
                .join("")}
            </body>
          </html>`)

          return;
        }

        response['404'] = function() {
          response.writeHead(404);
          response.end();
        }

        //End set up response
        

        //Get response

        //Response of development static file
        if(request.poutlet.headers.path_key === '/poutlet_dev_static') {
          if(poutlet_dev_static[request.poutlet.headers.pathname] !== undefined) {
            for(var i in poutlet_dev_static[request.poutlet.headers.pathname].headers) {
              response.setHeader(i, poutlet_dev_static[request.poutlet.headers.pathname].headers[i]);
            }

            response.send(poutlet_dev_static[request.poutlet.headers.pathname].body);

          } else {
            response['404']();
          }
          
          return;
        }

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
            response['404']();
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
              response['404']();
            }
          }
        }

        return true;
      }
    )
    .listen(config_http2.port_dev)
    .setTimeout(config_http2.server_timeout);



  }
  catch(e) {
    console.log(e);
  }

  return true;
};
