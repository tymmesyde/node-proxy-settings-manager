const os = require('os');
const url = require('url');
const fs = require('fs');
const isGnome = require('is-gnome');
const assert = require('assert');
const regedit = require('regedit');
const proxy = require('../src/index.js');
const { childExec } = require('../src/utils.js');
const { LINUX, GNOME, WINDOWS } = require('../src/config.js');

const proxyUrl = 'http://localhost:5050';
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
                    const mode = await childExec(`gsettings get ${GNOME.mode}`);
                    assert.match(mode, /manual/);

                    const host = await childExec(`gsettings get ${GNOME.http.host}`);
                    assert.match(host, RegExp(`${proxyHost}`));

                    const port = await childExec(`gsettings get ${GNOME.http.port}`);
                    assert.match(port, RegExp(`${proxyPort}`));
                } else {
                    const env = fs.readFileSync(LINUX.path, { encoding: 'utf-8' });
                    assert.equal(LINUX.http.filter(k => env.indexOf(k)).length, LINUX.http.length);
                }
 
                return Promise.resolve();
            });
        } else if (platform === 'win32') {
            it('it should set regedit values', async () => {
                await proxy.setHttp(proxyUrl);
                return testWin32Proxy();
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
                    const mode = await childExec(`gsettings get ${GNOME.mode}`);
                    assert.match(mode, /manual/);

                    const host = await childExec(`gsettings get ${GNOME.https.host}`);
                    assert.match(host, RegExp(`${proxyHost}`));

                    const port = await childExec(`gsettings get ${GNOME.https.port}`);
                    assert.match(port, RegExp(`${proxyPort}`));
                } else {
                    const env = fs.readFileSync(LINUX.path, { encoding: 'utf-8' });
                    assert.equal(LINUX.http.filter(k => env.indexOf(k)).length, LINUX.https.length);
                }
 
                return Promise.resolve();
            });
        } else if (platform === 'win32') {
            it('it should set regedit values', async () => {
                await proxy.setHttps(proxyUrl);
                return testWin32Proxy();
            });
        }
    });
});

describe('remove', () => {
    if (platform === 'linux') {
        it('it should remove gsettings keys or env vars', async () => {
            await proxy.remove();

            if (await isGnome) {
                const mode = await childExec(`gsettings get ${GNOME.mode}`);
                const httpHost = await childExec(`gsettings get ${GNOME.http.host}`);
                const httpsHost = await childExec(`gsettings get ${GNOME.https.host}`);

                assert.match(mode, /none/);
                assert.match(httpHost, /''/);
                assert.match(httpsHost, /''/);
            } else {
                const env = fs.readFileSync(LINUX.path, { encoding: 'utf-8' });
                assert.equal(!LINUX.http.filter(e => env.indexOf(e)).length, 0);
            }

            return Promise.resolve();
        });
    } else if (platform === 'win32') {
        it('it should reset regedit values', async () => {
            await proxy.remove();

            regedit.list([WINDOWS.path], (err, result) => {
                const { ProxyEnable, ProxyServer } = result[WINDOWS.path].values;
                assert.equal(ProxyEnable.value, 0);
                assert.equal(ProxyServer.value, '');
                return Promise.resolve();
            });
        });
    }
});

function testWin32Proxy() {
    return new Promise(resolve => {
        regedit.list([WINDOWS.path], (err, result) => {
            const { ProxyEnable, ProxyServer } = result[WINDOWS.path].values;
            assert.equal(ProxyEnable.value, 1);
            assert.equal(ProxyServer.value, `${proxyHost}:${proxyPort}`);
            resolve();
        });
    });
}