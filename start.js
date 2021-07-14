var http2 = require('./lib/http2/http2.js');
var live_reload = require('./lib/live_reload/live_reload.js');
var install = require('./lib/install/install.js'); 
var http = require('./lib/http/http.js');
var route_ui = require('./lib/route_ui/route_ui.js');
var config = require('./config.js');

install();

http2(config.http2);

http(config.http2);

route_ui(config.http2);

live_reload(config.http2); 