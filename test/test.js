const os = require('os');
const fs = require('fs');
const isGnome = require('is-gnome');
const assert = require('assert');
const { Registry } = require('rage-edit');
const proxy = require('../src/index.js');
const { childExec } = require('../src/utils.js');
const { LINUX, GNOME, WINDOWS } = require('../src/config.js');

const proxyUrl = 'http://localhost:5050';
const { hostname: proxyHost, port: proxyPort } = new URL(proxyUrl);
const malformedProxyUrl = 'http:/localhost:5050';
const platform = os.platform();

describe('setHttp', () => {
    describe('do not provide url', () => {
        it('should throw an error', async () => {
            try {
                await proxy.setHttp();
            } catch (e) {
                assert.strictEqual(e, 'Url not provided');
            }
        });
    });

    describe('provide malformed url', () => {
        it('should throw an error', async () => {
            try {
                await proxy.setHttp(malformedProxyUrl);
            } catch (e) {
                assert.strictEqual(e, 'Malformed url');
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
                    assert.strictEqual(LINUX.http.filter(k => env.includes(k)).length, LINUX.http.length);
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
                assert.strictEqual(e, 'Url not provided');
            }
        });
    });

    describe('provide malformed url', () => {
        it('should throw an error', async () => {
            try {
                await proxy.setHttps(malformedProxyUrl);
            } catch (e) {
                assert.strictEqual(e, 'Malformed url');
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
                    assert.strictEqual(LINUX.https.filter(k => env.includes(k)).length, LINUX.https.length);
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
                assert.strictEqual(LINUX.http.filter(e => env.includes(e)).length, 0);
                assert.strictEqual(LINUX.https.filter(e => env.includes(e)).length, 0);
            }

            return Promise.resolve();
        });
    } else if (platform === 'win32') {
        it('it should reset regedit values', async () => {
            await proxy.remove();

            const ProxyEnable = await Registry.get(WINDOWS.path, 'ProxyEnable');
            const ProxyServer = await Registry.get(WINDOWS.path, 'ProxyServer');

            assert.strictEqual(ProxyEnable, 0);
            assert.strictEqual(ProxyServer, '');

            return Promise.resolve();
        });
    }
});

async function testWin32Proxy() {
    const ProxyEnable = await Registry.get(WINDOWS.path, 'ProxyEnable');
    const ProxyServer = await Registry.get(WINDOWS.path, 'ProxyServer');

    assert.strictEqual(ProxyEnable, 1);
    assert.strictEqual(ProxyServer, `${proxyHost}:${proxyPort}`);
}