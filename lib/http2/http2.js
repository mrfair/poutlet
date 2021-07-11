var http = require("http");
var http2 = require("http2");
var fs = require('fs');

module.exports = function (config_http2) {
  http2.createSecureServer(
    {
      key: fs.readFileSync(config_http2.key_path),
      cert: fs.readFileSync(config_http2.cert_path),
    },
    (request, response) => {

      console.log(request.headers)

      response.end(`<script>
      const socket = new WebSocket('ws://${config_http2.hostname}:${config_http2.port_live_reload}', "livereload-protocol");

      socket.addEventListener('message', function (event) {
        console.log(event.data);
      });
  
    
      socket.addEventListener('close', function (event) {
        console.log('Reloading...');
        window.location.reload();
      });
      </script>`);

      return true;

    }).listen(config_http2.port_dev).setTimeout(config_http2.server_timeout)


  http
    .createServer(function (request, response) {
      res.writeHead(301, {
        location: `https://${config_http2.hostname}:${config_http2.port_dev}`
      });
      res.end();

      return true;
    })
    .listen(80);

  return true;
};
