// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/ocm',
    createProxyMiddleware({
      target: 'https://api.openchargemap.io',
      changeOrigin: true,
      pathRewrite: {
        '^/ocm': ''  // strip the `/ocm` prefix
      },
      onProxyReq(proxyReq) {
        // optionally log the outgoing URL:
        console.log('Proxying to OpenChargeMap:', proxyReq.path);
      }
    })
  );
};
