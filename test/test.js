const os = require('os');
const url = require('url');
const fs = require('fs');
const isGnome = require('is-gnome');
const assert = require('assert');
const proxy = require('../src/index.js');
const { childExec } = require('../src/utils.js');
const { LINUX_ENV, GNOME_SETTINGS } = require('../src/config.js');

const proxyUrl = 'http://locahost:5050';
const { hostname: proxyHost, port: proxyPort  } = url.parse(proxyUrl);
const malformedProxyUrl = 'http:/localhost:5050';
const platform = os.platform();

describe('setHttp', () => {
    describe('do not provide url', () => {
        it('should throw an error', async () => {
            try {
                await proxy.setHttp();
            } catch (e) {
                assert.equal(e, 'Url not provided');
            }
        });
    });

    describe('provide malformed url', () => {
        it('should throw an error', async () => {
            try {
                await proxy.setHttp(malformedProxyUrl);
            } catch (e) {
                assert.equal(e, 'Malformed url');
            }
        });
    });

    describe('provide valid url', () => {
        if (platform === 'linux') {
            it('it should set gsettings keys or env vars', async () => {
                await proxy.setHttp(proxyUrl);

                if (await isGnome) {
                    const mode = await childExec(`gsettings get ${GNOME_SETTINGS.mode}`);
                    assert.match(mode, /manual/);

                    const host = await childExec(`gsettings get ${GNOME_SETTINGS.http.host}`);
                    assert.match(host, RegExp(`${proxyHost}`));

                    const port = await childExec(`gsettings get ${GNOME_SETTINGS.http.port}`);
                    assert.match(port, RegExp(`${proxyPort}`));
                } else {
                    const env = fs.readFileSync(LINUX_ENV.path, { encoding: 'utf-8' });
                    assert.equal(LINUX_ENV.http.filter(k => env.indexOf(k)).length, LINUX_ENV.http.length);
                }
 
                return Promise.resolve();
            });
        }
    });
});

describe('setHttps', () => {
    describe('do not provide url', () => {
        it('should throw an error', async () => {
            try {
                await proxy.setHttps();
            } catch (e) {
                assert.equal(e, 'Url not provided');
            }
        });
    });

    describe('provide malformed url', () => {
        it('should throw an error', async () => {
            try {
                await proxy.setHttps(malformedProxyUrl);
            } catch (e) {
                assert.equal(e, 'Malformed url');
            }
        });
    });

    describe('provide valid url', () => {
        if (platform === 'linux') {
            it('it should set gsettings keys or env vars', async () => {
                await proxy.setHttps(proxyUrl);

                if (await isGnome) {
                    const mode = await childExec(`gsettings get ${GNOME_SETTINGS.mode}`);
                    assert.match(mode, /manual/);

                    const host = await childExec(`gsettings get ${GNOME_SETTINGS.https.host}`);
                    assert.match(host, RegExp(`${proxyHost}`));

                    const port = await childExec(`gsettings get ${GNOME_SETTINGS.https.port}`);
                    assert.match(port, RegExp(`${proxyPort}`));
                } else {
                    const env = fs.readFileSync(LINUX_ENV.path, { encoding: 'utf-8' });
                    assert.equal(LINUX_ENV.http.filter(k => env.indexOf(k)).length, LINUX_ENV.https.length);
                }
 
                return Promise.resolve();
            });
        }
    });
});

describe('remove', () => {
        if (platform === 'linux') {
            it('it should remove gsettings keys or env vars', async () => {
                await proxy.remove();

                if (await isGnome) {
                    const mode = await childExec(`gsettings get ${GNOME_SETTINGS.mode}`);
                    const httpHost = await childExec(`gsettings get ${GNOME_SETTINGS.http.host}`);
                    const httpsHost = await childExec(`gsettings get ${GNOME_SETTINGS.https.host}`);

                    assert.match(mode, /none/);
                    assert.match(httpHost, /''/);
                    assert.match(httpsHost, /''/);
                } else {
                    const env = fs.readFileSync(LINUX_ENV.path, { encoding: 'utf-8' });
                    assert.equal(!LINUX_ENV.http.filter(e => env.indexOf(e)).length, 0);
                }
 
                return Promise.resolve();
            });
        }
});