var http2 = require('./lib/http2/http2.js');
var http = require('./lib/http/http.js');
var route_ui = require('./lib/route_ui/route_ui.js');
var config = require('./config.js');
var builder = require('./lib/builder/builder.js');
var sass_watch = require('./lib/sass/sass_watch.js');

(async function() {
  http2(config.http2);

  //http(config.http2);
  
  route_ui(config.http2);

  sass_watch();

  setTimeout(function() {
    builder();
  }, 1000);
})();