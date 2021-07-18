var http = require("http");

module.exports = function (config_http2) {
  try {
    http
      .createServer(function (request, response) {
        response.writeHead(301, {
          location: `https://${config_http2.hostname_dev}:${config_http2.port_dev}`,
        });
        response.end();

        return true;
      })
      .listen(80)
      .setTimeout(config_http2.server_timeout);

  }
  catch(e) {
    console.log(e);
  }

  return true;
};
