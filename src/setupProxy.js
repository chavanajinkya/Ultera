const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/Ultera',
        createProxyMiddleware({
            target: 'http://10.0.129.33:9084',
            secure: false
        }),
    );

    app.use(
        '/UlteraAdmin',
        createProxyMiddleware({
            target: 'http://10.0.129.33:9084',
            secure: false
        }),
    );
};