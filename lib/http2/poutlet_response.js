var fs = require("fs");
var zlib = require("zlib");
var etag = require("etag");
var path = require("path");
var cookie = require("cookie");

module.exports = function (request, response, config_http2, mode) {
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "public, max-age=604800, immutable");

  response.cookie = cookie;

  response.static = [];

  response.send = function (data) {
    zlib.gzip(data, (err, buffer) => {
      if (err === null) {
        response.setHeader("content-length", buffer.length);
        response.setHeader("content-encoding", "gzip");
        response.setHeader("ETag", etag(buffer));
        response.end(buffer);
      } else {
        console.log(err);
      }
    });

    return;
  };

  response.json = function (data) {
    response.setHeader("Content-Type", "application/json");
    response.send(JSON.stringify(data));

    return;
  };

  response.html = function (body, config) {
    if (!config) config = {};

    response.setHeader("Content-Type", "text/html; charset=utf-8");

    var poutlet_css_global = "";

    var _static =
      config_http2.response_html &&
      Array.isArray(config_http2.response_html.static) === true
        ? config_http2.response_html.static
        : [];

    if (Array.isArray(config.static) === true)
      _static = _static.concat(config.static);

    if (Array.isArray(response.static) === true)
      _static = _static.concat(response.static);

    //if dev mode
    if (mode !== "build") {
      _static = _static.concat([
        {
          link: "/poutlet_dev_static/live_reload.js",
          as: "script",
          defer: true,
        },
      ]);

      if (fs.existsSync(path.resolve(`poutlet_root/global.css`)) === true) {
        poutlet_css_global = fs.readFileSync(
          path.resolve(`poutlet_root/global.css`),
          {
            encoding: "utf8",
            flag: "r",
          }
        );
      }
    } else {
      if (fs.existsSync("poutlet_lib/poutlet_root/global.css") === true) {
        poutlet_css_global = fs.readFileSync(
          "poutlet_lib/poutlet_root/global.css",
          {
            encoding: "utf8",
            flag: "r",
          }
        );
      }
    }
    //

    var _data = `<!DOCTYPE html>
    <html ⚡ lang="${config_http2.lang}">
      <head>
        <meta charset="utf-8" />
        ${_static
          .map(function (v) {
            return `<link rel="preload" href="${
              v.link
            }" as="${v.as}" ${v.integrity !== undefined ? `integrity="${v.integrity}"` : ""} ${v.crossorigin !== undefined ? `crossorigin="${v.crossorigin}"` : ""}>`;
          })
          .join("")}
        <style id="poutlet-css-global">${poutlet_css_global}</style>
        <style id="poutlet-css-local">${request.poutlet.css}</style>
      </head>
      <body>
        ${body}
        ${_static
          .map(function (v) {
            if (v.as === "script") {
              return `<script type="text/javascript" ${
                v.async === true ? `async="async"` : ""
              } ${v.defer === true ? `defer="defer"` : ""} ${
                v.integrity ? `integrity="${v.integrity}"` : ""
              } ${v.crossorigin ? `crossorigin="${v.crossorigin}"` : ""} src="${
                v.link
              }" ${
                v.referrerpolicy ? `referrerpolicy="${v.referrerpolicy}"` : ""
              }></script>`;
            } else if (v.as === "style") {
              return `<link rel="stylesheet" href="${v.link}" ${
                v.integrity ? `integrity="${v.integrity}"` : ""
              } ${v.crossorigin ? `crossorigin="${v.crossorigin}"` : ""} ${
                v.referrerpolicy ? `referrerpolicy="${v.referrerpolicy}"` : ""
              } />`;
            }
          })
          .join("")}
      </body>
    </html>`;

    response.send(_data);

    return;
  };

  response["404"] = function () {
    response.writeHead(404);
    response.end();
  };
};
