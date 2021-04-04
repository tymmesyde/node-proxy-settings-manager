const os = require('os');
const url = require('url');
const isGnome = require('is-gnome');
const { setWindowsProxy, removeWindowsProxy } = require('./platforms/windows');
const { manageGnomeProxy } = require('./platforms/gnome');
const { manageLinuxProxy } = require('./platforms/linux');

module.exports.setHttp = url => {
    if (!url) return Promise.reject('Url not provided');
    return manageProxy(url, 'http');
}

module.exports.setHttps = url => {
    if (!url) return Promise.reject('Url not provided');
    return manageProxy(url, 'https');
}

module.exports.remove = () => {
    return Promise.all([
        manageProxy('', 'http', true),
        manageProxy('', 'https', true)
    ]);
}

async function manageProxy(proxyUrl, type, reset = false) {
    const { protocol, hostname, port } = url.parse(proxyUrl);

    if (!reset && (!protocol || !hostname || !port)) return Promise.reject('Malformed url');

    switch (os.platform()) {
        case 'linux':
            await isGnome ? 
                await manageGnomeProxy({
                    hostname,
                    port,
                    type
                }, reset) :
                await manageLinuxProxy({
                    protocol,
                    hostname,
                    port,
                    type
                }, reset);
            break;

        case 'win32':
            return reset ? removeWindowsProxy() : setWindowsProxy(hostname, port);
    
        default:
            return Promise.reject('Your platform is not supported at the moment.');
    }
}