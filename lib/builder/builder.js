var fs = require("fs");
var path = require("path");
var fse = require('fs-extra');

module.exports = function () {

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
    "cookie": "^0.4.1",
    "crypto-js": "^4.0.0",
    "etag": "^1.8.1",
    "fs-path": "^0.0.25",
    "lzutf8": "^0.6.0",
    "mime-types": "^2.1.29",
    "moment": "^2.29.1",
    "mongodb": "^3.6.5"
  };


  var _package_json = `{
    "dependencies": ${JSON.stringify(_dependencies)},
    "scripts": {
      "start": "node start.js"
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

  //Create poutlet_plugin_response.js
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_config.http2.version}/poutlet_lib/poutlet_plugin_response.js`
    ),
    fs.readFileSync(`${__dirname}/../http2/poutlet_plugin_response.js`, {
      encoding: "utf8",
      flag: "r",
    })
  );
  
  //Create poutlet_response.js
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_config.http2.version}/poutlet_lib/poutlet_response.js`
    ),
    fs.readFileSync(`${__dirname}/../http2/poutlet_response.js`, {
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
  

  //Copy cert and key
  if (
    fs.existsSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_config.http2.version}/cert`)
    ) !== true
  ) {
    fs.mkdirSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_config.http2.version}/cert`)
    );
  }

  
  if (
    fs.existsSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_config.http2.version}/cert/localhost`)
    ) !== true
  ) {
    fs.mkdirSync(
      path.resolve(`poutlet_build/poutlet_server/v.${_config.http2.version}/cert/localhost`)
    );
  }
  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_config.http2.version}/cert/localhost/cert.pem`
    ),
    fs.readFileSync(`${__dirname}/../http2/cert.pem`, {
      encoding: "utf8",
      flag: "r",
    })
  );

  fs.writeFileSync(
    path.resolve(
      `poutlet_build/poutlet_server/v.${_config.http2.version}/cert/localhost/privkey.pem`
    ),
    fs.readFileSync(`${__dirname}/../http2/privkey.pem`, {
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
  var tls = require("tls");
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
        console.log(e);
        console.log('Invalid server name ' + hostname);
        callback('Invalid server name ' + hostname);
      }
      return;
    },
  }, function(request, response) {
    
    request.poutlet = {
      headers: require("./poutlet_lib/poutlet_headers.js")(request, config.http2),
      css: "",
    };

    if (
      Array.isArray(config.http2.access_control_allow_origin) ===
        true &&
      config.http2.access_control_allow_origin.length > 0 &&
      (config.http2.access_control_allow_origin.indexOf("*") > -1 ||
        config.http2.access_control_allow_origin.indexOf(
          request.poutlet.headers.origin
        ) > -1)
    ) {
      response.setHeader(
        "Access-Control-Allow-Origin",
        request.poutlet.headers.origin
      );
    }

     
    require('./poutlet_lib/poutlet_response.js')(request, response, config.http2, 'build');

    require('./poutlet_lib/poutlet_plugin_response.js')(request, response, 'build');

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
