var cookie = require('cookie');

module.exports = function (request, config_http2) {
  var _headers = {};

  for (var i in config_http2.headers_mapping) {
    _headers[i] = request.headers[config_http2.headers_mapping[i]];
  }


  _headers.method = _headers.method.toLowerCase();

  _headers.port = _headers.hostname.split(":")[1];

  _headers.host = _headers.hostname.split(":")[0];

  _headers.pathname = _headers.path.split("?")[0];

  _headers.path_key = '/' + _headers.pathname.split('/')[1];

  //Path key for static
  if(_headers.pathname.indexOf("/static/") > -1) {
    _headers.path_key = _headers.pathname.split('/static/')[0] || "/" ;
  } 


  _headers.query = (function () {
    var _path = decodeURI(_headers.path).split("?");
    if (_path[1] !== undefined) {
      return _path[1]
        .split("&")
        .map(function (p) {
          return p.split("=");
        })
        .reduce(function (values, r) {
          values[r[0]] = r[1];
          return values;
        }, {});
    } else {
      return {};
    }
  })();

  _headers.cookie = cookie.parse(request.headers.cookie || '');

  return _headers;
};
