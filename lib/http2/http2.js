var http2 = require("http2");
var fs = require("fs");
var live_reload = require('../live_reload/live_reload.js');

module.exports = async function (config_http2) {
  try {
    live_reload(config_http2);

    //Set up development static file
    var poutlet_dev_static = {
      "/poutlet_dev_static/live_reload.js": {
        headers: {
          "Content-Type": "text/javascript",
        },
        body: require("../live_reload/client_script.js")(config_http2),
      },
    };

    var {ObjectId, DB} = await require('../mongodb/mongodb.js')(); 

    //Poutlet plugin
    http2
      .createSecureServer(
        {
          key: fs.readFileSync(config_http2.key_path_dev),
          cert: fs.readFileSync(config_http2.cert_path_dev),
        },
        (request, response) => {
          try {
            
            //Setup request

            request.poutlet = {
              headers: require("./poutlet_headers.js")(request, config_http2),
              css: "",
              ObjectId,
              DB
            };

            if (
              Array.isArray(config_http2.access_control_allow_origin_dev) ===
                true &&
              config_http2.access_control_allow_origin_dev.length > 0 &&
              (config_http2.access_control_allow_origin_dev.indexOf("*") > -1 ||
                config_http2.access_control_allow_origin_dev.indexOf(
                  request.poutlet.headers.origin
                ) > -1)
            ) {
              response.setHeader(
                "Access-Control-Allow-Origin",
                request.poutlet.headers.origin
              );
            }

            //End setup request
            


            //Set up response
            require('./poutlet_response.js')(request, response, config_http2);
            //End set up response

            //Get response

            //Response of development static file
            if (request.poutlet.headers.path_key === "/poutlet_dev_static") {
              if (
                poutlet_dev_static[request.poutlet.headers.pathname] !==
                undefined
              ) {
                for (var i in poutlet_dev_static[
                  request.poutlet.headers.pathname
                ].headers) {
                  response.setHeader(
                    i,
                    poutlet_dev_static[request.poutlet.headers.pathname]
                      .headers[i]
                  );
                }

                response.send(
                  poutlet_dev_static[request.poutlet.headers.pathname].body
                );
              } else {
                response["404"]();
              }

              return;
            }

            require('./poutlet_plugin_response.js')(request, response);

            

            return true;
          } catch (e) {
            console.log(e);

            response.writeHead(500);
            response.end();
          }
        }
      )
      .listen(config_http2.port_dev)
      .setTimeout(config_http2.server_timeout);

    console.log(
      `HTTP2 development server run at https://${config_http2.hostname_dev}:${config_http2.port_dev}`
    );
  } catch (e) {
    console.log(e);
  }

  return true;
};
