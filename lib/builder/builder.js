var fs = require("fs");
var path = require("path");
var fse = require('fs-extra');

module.exports = function () {
  var _poutlet_plugin = require("../http2/poutlet_plugin.js");
  var _poutlet_headers = require("../http2/poutlet_headers");

  var _config = require("../../config.js");

  if (fs.existsSync(path.resolve("poutlet_build")) !== true) {
    fs.mkdirSync(path.resolve("poutlet_build"));
  }

  if (fs.existsSync(path.resolve("poutlet_build/poutlet_server")) !== true) {
    fs.mkdirSync(path.resolve("poutlet_build/poutlet_server"));
  }

  if (
    fs.existsSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_config.http2.version}`)
    ) !== true
  ) {
    fs.mkdirSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_config.http2.version}`)
    );
  }

  
  if (
    fs.existsSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_config.http2.version}/poutlet_lib`)
    ) !== true
  ) {
    fs.mkdirSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_config.http2.version}/poutlet_lib`)
    );
  }

  //Create package.json
  var _dependencies = {
    "bcryptjs": "^2.4.3",
    "busboy": "^0.3.1",
    "crypto-js": "^4.0.0",
    "etag": "^1.8.1",
    "fs-path": "^0.0.25",
    "lzutf8": "^0.6.0",
    "mime-types": "^2.1.29",
    "moment": "^2.29.1",
    "mongodb": "^3.6.5"
  };

  for(var i in _config.build.dependencies) {
    _dependencies[i] = _config.build.dependencies[i];
  }


  var _package_json = `{
    "dependencies": ${JSON.stringify(_dependencies)},
    "scripts": {
      "start": "node test/test.js"
    }
  }`;

  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_config.http2.version}/package.json`
    ),
    _package_json
  );

  //Create poutlet_headers.js
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_config.http2.version}/poutlet_lib/poutlet_headers.js`
    ),
    fs.readFileSync(`${__dirname}/../http2/poutlet_headers.js`, {
      encoding: "utf8",
      flag: "r",
    })
  );

  
  //Create poutlet_plugin.js
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_config.http2.version}/poutlet_lib/poutlet_plugin.js`
    ),
    fs.readFileSync(`${__dirname}/../http2/poutlet_plugin.js`, {
      encoding: "utf8",
      flag: "r",
    })
  );

  
  fse.copy(path.resolve('poutlet_root'), path.resolve(`poutlet_build/poutlet_server/v.${_config.http2.version}/poutlet_lib/poutlet_root`), { overwrite: true }, function (err) {});
  fse.copy(path.resolve('poutlet_static'), path.resolve(`poutlet_build/poutlet_server/v.${_config.http2.version}/poutlet_lib/poutlet_static`), { overwrite: true }, function (err) {});
  fse.copy(path.resolve('poutlet_plugin'), path.resolve(`poutlet_build/poutlet_server/v.${_config.http2.version}/poutlet_lib/poutlet_plugin`), { overwrite: true }, function (err) {});

  


  //Create start.js
  var _server = `
  var http2 = require("http2");
  var fs = require("fs");
  var zlib = require("zlib");
  var etag = require("etag");
  var config = ${JSON.stringify(_config)};
  
  http2.createSecureServer({
    SNICallback: (hostname, callback) => {
      if (hostname.substring(0, 4) === "www.") hostname = hostname.substring(4);
  
      try {
        callback(
          null,
          tls.createSecureContext({
            key: fs.readFileSync('${_config.http2.key_path.replace(/{hostname}/g, "'+hostname+'")}'),
            cert: fs.readFileSync('${_config.http2.cert_path.replace(/{hostname}/g, "'+hostname+'")}'),
          })
        );
      } catch (e) {
        console.log('Invalid server name ' + hostname);
      }
      return;
    },
  }, function(request, response) {
    
    request.poutlet = {
      headers: require("./poutlet_lib/poutlet_headers.js")(request, config.http2),
      css: "",
    };

    
    if (
      Array.isArray(config_http2.access_control_allow_origin) ===
        true &&
      config_http2.access_control_allow_origin.length > 0 &&
      (config_http2.access_control_allow_origin.indexOf("*") > -1 ||
        config_http2.access_control_allow_origin.indexOf(
          request.poutlet.headers.origin
        ) > -1)
    ) {
      response.setHeader(
        "Access-Control-Allow-Origin",
        request.poutlet.headers.origin
      );
    }

  })
  .listen(${_config.http2.port})
  .setTimeout(${_config.http2.server_timeout});`;

  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_config.http2.version}/start.js`
    ),
    _server
  );


};
