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
      referer: 'referer',
      scheme: ':scheme',
      origin: 'origin'
    },
    access_control_allow_origin_dev: [
      'https://localhost:3443',
      'https://localhost:3401'
    ],
    response_html: {
      static: [
        {
          link: "https://cdn.jsdelivr.net/npm/lzutf8/build/production/lzutf8.min.js",
          as: "script",
          defer: true,
        },
        {
          link: "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js",
          as: "script",
          defer: true,
          integrity:
            "sha512-nOQuvD9nKirvxDdvQ9OMqe2dgapbPB7vYAMrzJihw5m+aNcf0dX53m6YxM4LgA9u8e9eg9QX+/+mPu8kCNpV2A==",
          crossorigin: "anonymous",
          referrerpolicy: "no-referrer"
        },
        {
          link: "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/aes.min.js",
          as: "script",
          defer: true,
          integrity:
            "sha512-eqbQu9UN8zs1GXYopZmnTFFtJxpZ03FHaBMoU3dwoKirgGRss9diYqVpecUgtqW2YRFkIVgkycGQV852cD46+w==",
          crossorigin: "anonymous",
          referrerpolicy: "no-referrer"
        },
        {
          link: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css",
          as: "style",
          defer: true,
          integrity:
            "sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==",
          crossorigin: "anonymous",
          referrerpolicy: "no-referrer"
        },
      ]
    }
  }
}