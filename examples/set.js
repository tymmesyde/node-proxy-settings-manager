const proxyManager = require('../src/index.js');

const proxyUrl = 'http://locahost:5050';

(async () => {
    try {
        await proxyManager.setHttp(proxyUrl);
        await proxyManager.setHttps(proxyUrl);
    } catch (e) {
        console.error(e);
    }
})();
