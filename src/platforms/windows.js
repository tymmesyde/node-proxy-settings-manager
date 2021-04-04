const { Registry } = require('rage-edit');
const { WINDOWS } = require('../config');

function regeditPutValue({ key, type }, value) {
    return Registry.set(WINDOWS.path, key, value, type);
}

function setWindowsProxy(hostname, port) {
    return Promise.all([
        regeditPutValue(WINDOWS.server, `${hostname}:${port}`),
        regeditPutValue(WINDOWS.enable, 1),
    ]);
}

function removeWindowsProxy() {
    return Promise.all([
        regeditPutValue(WINDOWS.server, ''),
        regeditPutValue(WINDOWS.enable, 0),
    ]);
}

module.exports = {
    setWindowsProxy,
    removeWindowsProxy
};
