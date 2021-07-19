module.exports = {
  //
  http2: {
    key_path_dev: `${__dirname}/lib/http2/privkey.pem`,
    cert_path_dev: `${__dirname}/lib/http2/cert.pem`,
    hostname_dev: 'localhost',
    port_dev: 3443,
    port_live_reload: 3403,
    port_ui_api: 3401,
    server_timeout: 10000,
    headers_mapping: {
      method: ':method',
      hostname: ':authority',
      path: ':path',
      cookie: 'cookie',
      referer: 'referer',
      scheme: ':scheme',
      origin: 'origin'
    },
    access_control_allow_origin: [],
    access_control_allow_origin_dev: [
      'https://localhost:3443',
      'https://localhost:3401'
    ],
    response_html: {
      static: [
      ]
    }
  }
}