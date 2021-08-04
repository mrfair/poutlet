var fs = require("fs");
var path = require("path");
var fse = require('fs-extra');

module.exports = function () {

  
  var _poutlet_config = {};

  if(fs.existsSync(path.resolve('poutlet_config.json')) === true) {
    try {
      _poutlet_config = JSON.parse(fs.readFileSync(path.resolve('poutlet_config.json'), {
        encoding: "utf8",
        flag: "r",
      }));

    } catch(e) {
      console.log(e);
    }
  };

  if (fs.existsSync(path.resolve("poutlet_build")) !== true) {
    fs.mkdirSync(path.resolve("poutlet_build"));
  }

  if (fs.existsSync(path.resolve("poutlet_build/poutlet_server")) !== true) {
    fs.mkdirSync(path.resolve("poutlet_build/poutlet_server"));
  }

  if (
    fs.existsSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}`)
    ) !== true
  ) {
    fs.mkdirSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}`)
    );
  }

  
  if (
    fs.existsSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/poutlet_lib`)
    ) !== true
  ) {
    fs.mkdirSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/poutlet_lib`)
    );
  }

  //Create package.json
  var _dependencies = {
    "bcryptjs": "^2.4.3",
    "busboy": "^0.3.1",
    "cookie": "^0.4.1",
    "crypto-js": "^4.0.0",
    "etag": "^1.8.1",
    "fs-path": "^0.0.25",
    "lzutf8": "^0.6.0",
    "mime-types": "^2.1.29",
    "moment": "^2.29.1",
    "mongodb": "^3.6.5",
    "sharp": "^0.28.3",
  };


  var _package_json = `{
    "dependencies": ${JSON.stringify(_dependencies)},
    "scripts": {
      "start": "node start.js"
    }
  }`;

  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/package.json`
    ),
    _package_json
  );

  //Create poutlet_config.json
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/poutlet_config.json`
    ),
    fs.readFileSync(path.resolve('poutlet_config.json'), {
      encoding: "utf8",
      flag: "r",
    })
  );
  
  //Create mongodb.js
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/poutlet_lib/mongodb.js`
    ),
    fs.readFileSync(`${__dirname}/../mongodb/mongodb.js`, {
      encoding: "utf8",
      flag: "r",
    })
  );

  //Create poutlet_headers.js
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/poutlet_lib/poutlet_headers.js`
    ),
    fs.readFileSync(`${__dirname}/../http2/poutlet_headers.js`, {
      encoding: "utf8",
      flag: "r",
    })
  );

  //Create poutlet_plugin_response.js
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/poutlet_lib/poutlet_plugin_response.js`
    ),
    fs.readFileSync(`${__dirname}/../http2/poutlet_plugin_response.js`, {
      encoding: "utf8",
      flag: "r",
    })
  );
  
  //Create poutlet_response.js
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/poutlet_lib/poutlet_response.js`
    ),
    fs.readFileSync(`${__dirname}/../http2/poutlet_response.js`, {
      encoding: "utf8",
      flag: "r",
    })
  );

  //Create poutlet_plugin.js
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/poutlet_lib/poutlet_plugin.js`
    ),
    fs.readFileSync(`${__dirname}/../http2/poutlet_plugin.js`, {
      encoding: "utf8",
      flag: "r",
    })
  );
  

  //Copy cert and key
  if (
    fs.existsSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/cert`)
    ) !== true
  ) {
    fs.mkdirSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/cert`)
    );
  }

  
  if (
    fs.existsSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/cert/localhost`)
    ) !== true
  ) {
    fs.mkdirSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/cert/localhost`)
    );
  }
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/cert/localhost/cert.pem`
    ),
    fs.readFileSync(`${__dirname}/../http2/cert.pem`, {
      encoding: "utf8",
      flag: "r",
    })
  );

  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/cert/localhost/privkey.pem`
    ),
    fs.readFileSync(`${__dirname}/../http2/privkey.pem`, {
      encoding: "utf8",
      flag: "r",
    })
  );
  
  fse.copy(path.resolve('poutlet_root'), path.resolve(`poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/poutlet_lib/poutlet_root`), { overwrite: true }, function (err) {});
  fse.copy(path.resolve('poutlet_static'), path.resolve(`poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/poutlet_lib/poutlet_static`), { overwrite: true }, function (err) {});
  fse.copy(path.resolve('poutlet_plugin'), path.resolve(`poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/poutlet_lib/poutlet_plugin`), { overwrite: true }, function (err) {});

  //Create start.js
  var _server = `
  var http2 = require("http2");
  var fs = require("fs");
  var path = require("path");
  var zlib = require("zlib");
  var etag = require("etag");
  var tls = require("tls");
  var Busboy = require("busboy");
  var Sharp = require("sharp");
  var os = require('os');

  (async function() {
        
    var poutlet_config = {};

    if(fs.existsSync(path.resolve('poutlet_config.json')) === true) {
      try {
        poutlet_config = JSON.parse(fs.readFileSync(path.resolve('poutlet_config.json'), {
          encoding: "utf8",
          flag: "r",
        }));

      } catch(e) {
        console.log(e);
      }
    };
    
    var poutlet_plugin_response = require('./poutlet_lib/poutlet_plugin_response.js');
    var poutlet_response = require('./poutlet_lib/poutlet_response.js');
    var poutlet_headers = require("./poutlet_lib/poutlet_headers.js");
    var {ObjectId, DB} = await require('./poutlet_lib/mongodb.js')();
    var http2_middleware = function(request, response) {};

    if(fs.existsSync('./poutlet_lib/poutlet_root/http2_middleware.js') === true) {
      http2_middleware = require('./poutlet_lib/poutlet_root/http2_middleware.js');
    }
    
    http2.createSecureServer({
      SNICallback: (hostname, callback) => {
        if (hostname.substring(0, 4) === "www.") hostname = hostname.substring(4);
    
        try {
          callback(
            null,
            tls.createSecureContext({
              key: fs.readFileSync(poutlet_config.http2.key_path.replace(/{hostname}/g, hostname)),
              cert: fs.readFileSync(poutlet_config.http2.cert_path.replace(/{hostname}/g, hostname)),
            })
          );
        } catch (e) {
          console.log(e);
          console.log('Invalid server name ' + hostname);
          callback('Invalid server name ' + hostname);
        }
        return;
      },
    }, function(request, response) {
      
      request.poutlet = {
        headers: poutlet_headers(request, poutlet_config.http2),
        css: "",
        ObjectId,
        DB
      };
  
      if (
        Array.isArray(poutlet_config.http2.access_control_allow_origin) ===
          true &&
          poutlet_config.http2.access_control_allow_origin.length > 0 &&
        (poutlet_config.http2.access_control_allow_origin.indexOf("*") > -1 ||
        poutlet_config.http2.access_control_allow_origin.indexOf(
            request.poutlet.headers.origin
          ) > -1)
      ) {
        response.setHeader(
          "Access-Control-Allow-Origin",
          request.poutlet.headers.origin
        );
      }
  
       
      poutlet_response(request, response, poutlet_config.http2, 'build');

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

            poutlet_plugin_response(request, response, 'build');
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
              uploads[i].uploadPath = _d + '/' + uploads[i].name;

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
                path.join(os.tmpdir(), fieldname) + '-' + +new Date() + '_' + Math.random().toString(36).substring(7),
              name: +new Date() + '_' + Math.random().toString(36).substring(7) + path.extname(filename),
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

          poutlet_plugin_response(request, response, 'build');
        });
      }
  
      
  
    })
    .listen(poutlet_config.http2.port)
    .setTimeout(+poutlet_config.http2.server_timeout);

  })();
  
  `;

  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_poutlet_config.http2.version}/start.js`
    ),
    _server
  );


};
