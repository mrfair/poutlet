var http2 = require('./lib/http2/http2.js');
var live_reload = require('./lib/live_reload/live_reload.js');
var install = require('./lib/install/install.js'); 
var http = require('./lib/http/http.js');
var route_ui = require('./lib/route_ui/route_ui.js');

module.exports = {
  config: require('./config.js'),
  start: function() {
    install();

    http2(this.config.http2);
    
    http(this.config.http2);

    route_ui(this.config.http2);

    live_reload(this.config.http2); 
  }
}