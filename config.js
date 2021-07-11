module.exports = {
  //
  http2: {
    key_path: `${__dirname}/lib/http2/privkey.pem`,
    cert_path: `${__dirname}/lib/http2/cert.pem`,
    hostname: 'localhost',
    port_dev: 3443,
    port_live_reload: 3403,
    server_timeout: 10000,
    header_mapping: {
      method: ':method',
      hostname: ':authority',
      path: ':path',
      cookie: 'cookie',
      referer: 'referer'
    }
  }
}