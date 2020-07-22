const regedit = require('regedit');

const REGEDIT = {
    path: 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings',
    enable: {
        key: 'ProxyEnable',
        type: 'REG_DWORD'
    },
    server: {
        key: 'ProxyServer',
        type: 'REG_SZ'
    }
};

function regeditPutValue({ key, type }, value) {
    return new Promise((resolve, reject) => {
        regedit.putValue({
            [REGEDIT.path]: {
                [key]: {
                    value,
                    type
                }
            }
        }, err => {
            if (err) reject(err);
            resolve();
        });
    });
}

function setWindowsProxy(hostname, port) {
    return Promise.all([
        regeditPutValue(REGEDIT.server, `${hostname}:${port}`),
        regeditPutValue(REGEDIT.enable, 1),
    ]);
}

function removeWindowsProxy() {
    return Promise.all([
        regeditPutValue(REGEDIT.server, ''),
        regeditPutValue(REGEDIT.enable, 0),
    ]);
}

module.exports = {
    setWindowsProxy,
    removeWindowsProxy
};
