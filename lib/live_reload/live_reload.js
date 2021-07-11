var WebSocketServer = require("websocket").server;
var http = require("http");

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
  });

  setTimeout(function() {
    if(wsServer.connections.length === 0) require('open')(`https://${config_http2.hostname}:${config_http2.port_dev}`);
  }, 1000);

  return true;
}; 
