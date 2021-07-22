var http2 = require("http2");
var fs = require("fs");
var poutlet_plugin = require("poutlet/lib/http2/poutlet_plugin")();

module.exports = function (config_http2) {
  try {
    //Api ui
    http2
      .createSecureServer(
        {
          key: fs.readFileSync(config_http2.key_path_dev),
          cert: fs.readFileSync(config_http2.cert_path_dev),
        },
        (request, response) => {
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.setHeader("Cache-Control", "no-cache");

          var _script = '';

          var _row = '';

          for(let i in poutlet_plugin) {
            _row += `<tr><td colspan="100%" class="pl-row-pathname"><div>Pathname : ${i.split('_'+poutlet_plugin[i].hostname)[0]}</div><div>Hostname: ${poutlet_plugin[i].hostname}</div></td></tr>`;

            for(var method in poutlet_plugin[i].method) {
              for(var path in poutlet_plugin[i].method[method]) {
                
                var _header = '';
                for(var header in poutlet_plugin[i].method[method][path].headers) {
                  _header += `<div>${header} : ${poutlet_plugin[i].method[method][path].headers[header]}</div>`;
                }

                _row += `<tr valign="top">
                          <td>${path}</td>
                          <td><span class="pl-method-container pl-method-container-${method}">${method}</span></td>
                          <td>${_header}</td>
                          <td>${Buffer.isBuffer(poutlet_plugin[i].method[method][path].body) === true ? 'Buffer' : typeof poutlet_plugin[i].method[method][path].body}</td>
                          <td id="${method}-status-${encodeURIComponent(path)}"></td>
                          <td id="${method}-url-${encodeURIComponent(path)}"></td>
                          <td id="${method}-text-${encodeURIComponent(path)}"></td>
                        </tr>`;

                _script += `_test_request("${method}", "${path}", function(response){
                  console.log(response)
                  document.getElementById("${method}-status-${encodeURIComponent(path)}").innerHTML = '<span class="' + (response.status === 200 ? 'pl-text-green' : 'pl-text-red') + '">' + response.status + '</span>';
                  document.getElementById("${method}-url-${encodeURIComponent(path)}").innerText = response.responseURL;

                  ${method === 'get' ? `document.getElementById("${method}-text-${encodeURIComponent(path)}").innerHTML = '<a href="https://${config_http2.hostname_dev}:${config_http2.port_dev}${path}" target="_blank">View</a>';` : `document.getElementById("${method}-text-${encodeURIComponent(path)}").innerText = response.responseText;`}
                });`
              }
              
            }
          }

  
          response.end(`<!DOCTYPE html>
          <html ⚡ lang="en">
            <head>
              <meta charset="utf-8" />
              <title>Poutlet route ui</title>
              <style>
                body {
                  padding: 0;
                  margin: 0;
                  font-family: Sans-serif;
                  font-size: 14px;
                }

                .pl-row-pathname {
                  background-color: #000;
                  color: #FFF;
                }

                .pl-method-container {
                  border-radius: 5px;
                  text-transform: uppercase;
                  display: inline-block;
                  padding: 2px 5px;
                  font-size: 12px;
                  color: #FFF;
                  font-weight: bold;
                }

                .pl-method-container-get {
                  background-color: orange;
                }

                .pl-method-container-post {
                  background-color: blue;
                }

                .pl-text-red {
                  color: red;
                }

                .pl-text-green {
                  color: green;
                }

                .pl-text-10 {
                  font-size: 10px;
                }
              </style>
            </head>
            <body>
              <div>
                <table border="1" cellpadding="10" cellspacing="0" width="100%">
                  <thead>
                    <th>Path</th>
                    <th>Method</th>
                    <th>Plugin response headers</th>
                    <th>Plugin response type</th>
                    <th>Response status</th>
                    <th>Response url</th>
                    <th>Response text</th>
                  </thead>
                  <tbody>
                  ${_row}
                  </tbody>
                </table>
              </div>
              <script type="text/javascript">
                console.log(${JSON.stringify(poutlet_plugin, function(key, val) {
                  if (typeof val === 'function') {
                    return val + ''; // implicitly `toString` it
                  }
                  return val;
                })});

                var _test_request = function(method, route, callback) {
                  var _request = new XMLHttpRequest();
    
                  _request.open(method, "https://${config_http2.hostname_dev}:${config_http2.port_dev}" + route, true);
    
                  _request.setRequestHeader("Content-Type", "text/plain");
    
                  _request.onreadystatechange = async function () {
                    callback(_request)
                  };
    
                  _request.send();
                }

                ${_script}
              
              </script>
            </body>
          </html>`);
        }
      )
      .listen(config_http2.port_ui_api)
      .setTimeout(config_http2.server_timeout);

      console.log(`Monitor server run at https://${config_http2.hostname_dev}:${config_http2.port_ui_api}`);

  }
  catch(e) {
    console.log(e);
  }

  return true;
};
