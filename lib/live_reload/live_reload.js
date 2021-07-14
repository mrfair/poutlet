var WebSocketServer = require("websocket").server;
var http = require("http");
var fs = require('fs');
var path = require('path');

module.exports = function (config_http2) {
  wsServer = new WebSocketServer({
    autoAcceptConnections: false,
    httpServer: http.createServer(function (request, response) {
      response.writeHead(404);
      response.end();
    }).listen(config_http2.port_live_reload),
  });


  wsServer.on("request", function (request) {
    var connection = request.accept("livereload-protocol", request.origin);
    
    connection.sendUTF('Live reload start : ' + new Date());

    /*
    fs.watch(path.resolve('poutlet_plugin'), function(event, filename) {
      console.log(event, filename); 
    })
    */
   
  });

  setTimeout(function() {
    if(wsServer.connections.length === 0) require('open')(`https://${config_http2.hostname}:${config_http2.port_dev}`);
  }, 500);

  return true;
}; 
