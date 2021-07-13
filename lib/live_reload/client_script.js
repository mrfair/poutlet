module.exports = function(config_http2) {
  return `const socket = new WebSocket('ws://${config_http2.hostname}:${config_http2.port_live_reload}', "livereload-protocol");
  
  socket.addEventListener('message', function (event) {

    console.log("%c %s", "text-shadow: -1px -1px hsl(0,100%,50%);", event.data);
  });
  
  
  socket.addEventListener('close', function (event) {
    console.log('Reloading...');
    window.location.reload();
  });`;
} 