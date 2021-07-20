var poutlet_plugin = require("./poutlet_plugin.js")('build');

module.exports = function (request, response, mode) {

  //ถ้าไม่ใช่ build mode ให้รับค่าใหม่เมื่อมีการ request
  if(mode !== 'build') poutlet_plugin = require("./poutlet_plugin.js")();


  //console.log(poutlet_plugin);

  var _request_poutlet_plugin = null;

  if (
    poutlet_plugin[`${request.poutlet.headers.path_key}_`] !==
    undefined
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

    if (_request_poutlet_plugin === null) {
      response["404"]();
    } else {
      if (
        _request_poutlet_plugin.method[
          request.poutlet.headers.method
        ]
      ) {

        if(_request_poutlet_plugin.spa ===  "true" && !_request_poutlet_plugin.method[
          request.poutlet.headers.method
        ][request.poutlet.headers.pathname]) {
          //SPA change request pathname to default pathname
          request.poutlet.headers.pathname = request.poutlet.headers.path_key;
        }

        if(_request_poutlet_plugin.method[
          request.poutlet.headers.method
        ][request.poutlet.headers.pathname]) {
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

          //Update css
          request.poutlet.css +=
            _request_poutlet_plugin.method[
              request.poutlet.headers.method
            ][request.poutlet.headers.pathname].css || "";

          if (
            typeof _request_poutlet_plugin.method[
              request.poutlet.headers.method
            ][request.poutlet.headers.pathname].body === "function"
          ) {
            _request_poutlet_plugin.method[
              request.poutlet.headers.method
            ][request.poutlet.headers.pathname].body(request, response);
          } else {
            response.end(
              _request_poutlet_plugin.method[
                request.poutlet.headers.method
              ][request.poutlet.headers.pathname].body
            );
          }
        } else {
          response["404"]();
        }
        
      } else {
        response["404"]();
      }
    }
  }
};
