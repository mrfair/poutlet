var http2 = require("http2");
var fs = require("fs");
var live_reload = require("../live_reload/live_reload.js");
var path = require("path");
var Busboy = require("busboy");
var Sharp = require("sharp");
var os = require('os');

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

    var { ObjectId, DB } = await require("../mongodb/mongodb.js")();

    var http2_middleware = function (request, response) {};

    if (
      fs.existsSync(path.resolve("poutlet_root/http2_middleware.js")) === true
    ) {
      http2_middleware = require(path.resolve(
        "poutlet_root/http2_middleware.js"
      ));
    }

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
              DB,
              max_upload_size: 5242880,
              image_resize_max_width: 1920,
              image_resize: true
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
            require("./poutlet_response.js")(request, response, config_http2);
            //End set up response

            //Get response

            //Middleware
            http2_middleware(request, response);

            if (
              request.poutlet.headers.method === 'post' && 
              request.headers["content-type"] !== undefined &&
              request.headers["content-type"].indexOf(
                "multipart/form-data;"
              ) === 0
            ) {

              var mime_allow_resize = [
                "image/webp",
                "image/png",
                "image/jpeg",
                "image/jpg",
              ];

              var TypeFileUpload = {
                "application/": "text",
                "text/": "text",
                "image/": "image",
                "audio/": "audio",
                "video/": "video",
              };

              let uploads = {};

              let upload_process = function (request, response) {

                var _fileSetBuffer = async (file, buffer) => {
                  request.file = file;
                  request.file.buffer = buffer;

                  require("./poutlet_plugin_response.js")(request, response);
                };

                var _d = new Date()
                  .toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
                  .split(",")[0]
                  .split("/");
                _d =
                  _d[2] +
                  (_d[0].length < 2 ? "0" + _d[0] : _d[0]) +
                  (_d[1].length < 2 ? "0" + _d[1] : _d[1]);

                for (let i in uploads) {
                  for (var it in TypeFileUpload) {
                    if (uploads[i].contentType.indexOf(it) >= 0) {
                      uploads[i].type = TypeFileUpload[it] || false;
                    }
                  }

                  if (uploads[i].type) {
                    uploads[i].uploadPath = `${_d}/${uploads[i].name}`;

                    fs.readFile(uploads[i].pathTemp, (err, buffer) => {
                      try {
                        if (buffer.toString().length > request.poutlet.max_upload_size)
                          throw new Error(
                            "File too big"
                          );

                        if (err) throw new Error("Can not read temporary file");
                      } catch (e) {
                        ErrorResponse(s, e.message);

                        return;
                      }

                      try {
                        if (
                          request.poutlet.image_resize === true && 
                          mime_allow_resize.indexOf(uploads[i].contentType) >=
                            0 &&
                          sizeOf(buffer).width > request.poutlet.image_resize_max_width
                        ) {
                          //Resize image
                          if (uploads[i].contentType === "image/png") {
                            Sharp(uploads[i].pathTemp)
                              .withMetadata()
                              .resize({
                                width: request.poutlet.image_resize_max_width,
                                withoutEnlargement: true,
                              })
                              .png({
                                compressionLevel: 9,
                                adaptiveFiltering: true,
                                force: true,
                              })
                              .toBuffer(function (err, buffer) {
                                if (err) throw new Error(err);

                                _fileSetBuffer(uploads[i], buffer);
                              });
                          } else {
                            Sharp(uploads[i].pathTemp)
                              .withMetadata()
                              .resize({
                                width: request.poutlet.image_resize_max_width,
                                withoutEnlargement: true,
                              })
                              .jpeg({
                                quality: 80,
                                force: false,
                              })
                              .toBuffer(function (err, buffer) {
                                if (err) throw new Error(err);

                                _fileSetBuffer(uploads[i], buffer);
                              });
                          }
                        } else {
                          _fileSetBuffer(uploads[i], buffer);
                        }
                      } catch (e) {
                        _fileSetBuffer(uploads[i], buffer);
                      }
                    });
                  } else {
                    throw new Error("Wrong file type");
                  }
                }
              };

              let busboy = new Busboy({
                headers: request.headers,
                limits: {
                  fileSize: request.poutlet.max_upload_size,
                },
              });

              busboy.on("error", function (e) {
                console.log(e);
              });

              busboy.on(
                "file",
                (fieldname, file, filename, encoding, mimetype) => {
                  uploads[fieldname] = {
                    pathTemp:
                      path.join(os.tmpdir(), fieldname) +
                      `-${+new Date()}_${Math.random()
                        .toString(36)
                        .substring(7)}`,
                    name: `${+new Date()}_${Math.random()
                      .toString(36)
                      .substring(7)}${path.extname(filename)}`,
                    contentType: mimetype,
                  };

                  file.pipe(fs.createWriteStream(uploads[fieldname].pathTemp));
                }
              );

              busboy.on("finish", () => {
                upload_process(request, response);
              });

              return request.pipe(busboy);
            } else {
              request.body = [];

              request.on("data", (data) => {
                request.body.push(data);
              });

              request.on("end", async (data) => {
                request.body = Buffer.concat(request.body).toString();

                //Response of development static file
                if (
                  request.poutlet.headers.path_key === "/poutlet_dev_static"
                ) {
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

                require("./poutlet_plugin_response.js")(request, response);
              });
            }

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
