module.exports = function(config_http2) {
  return `const socket = new WebSocket('ws://${config_http2.hostname_dev}:${config_http2.port_live_reload}', "livereload-protocol");
  
  socket.addEventListener('message', function (event) {
    try {
      var _r = JSON.parse(event.data);


      if(_r.type === 'start') {
        console.log("%c %s", "text-shadow: -1px -1px hsl(0,100%,50%);", _r.body);

        socket.send("Received signal");
      } else if(_r.type === 'css') {
        if(_r.element === 'poutlet-css-global') {
          document.getElementById(_r.element).innerHTML = _r.body;
        } else {
          if(window.location.pathname === _r.pathname ) {

            if(document.getElementById(_r.element) === null) {
              $('#poutlet-css-local').after('<style id="' + _r.element + '"></style>');
            }

            document.getElementById(_r.element).innerHTML = _r.body;
          }
        }
      }
    } catch(e) {
      console.log(e);
      console.log(event.data);
    }
    
    return;
  });
  
  socket.addEventListener('close', function (event) {
    console.log('Reloading...');

    window.location.reload();
  });`;
} 