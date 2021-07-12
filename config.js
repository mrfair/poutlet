module.exports = {
  //
  http2: {
    key_path: `${__dirname}/lib/http2/privkey.pem`,
    cert_path: `${__dirname}/lib/http2/cert.pem`,
    hostname: 'localhost',
    port: 443,
    port_dev: 3443,
    port_live_reload: 3403,
    port_ui_api: 3401,
    server_timeout: 10000,
    headers_mapping: {
      method: ':method',
      hostname: ':authority',
      path: ':path',
      cookie: 'cookie',
      referer: 'referer'
    }
  }
}