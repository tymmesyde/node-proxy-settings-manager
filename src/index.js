const os = require('os');
const fs = require('fs');
const url = require('url');
const isGnome = require('is-gnome');
const regedit = require('regedit');
const { LINUX_ENV, GNOME_SETTINGS, WINDOWS } = require('./config');
const utils = require('./utils');

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
                await manageGnome({
                    hostname,
                    port,
                    keys: GNOME_SETTINGS[type]
                }, reset) :
                await manageLinux({
                    protocol,
                    hostname,
                    port,
                    path: LINUX_ENV.path,
                    vars: LINUX_ENV[type]
                }, reset);
            break;

        case 'win32':
            await manageWindows({
                hostname,
                port
            }, reset);
            break;
    
        default:
            return Promise.reject('Your platform is not supported at the moment.');
    }
}

function manageLinux({ protocol, hostname, port, path, vars }, reset) {
    const address = `${protocol}://${hostname}:${port}`;

    if (fs.existsSync(path)) {
        let env = fs.readFileSync(path, { encoding: 'utf-8' });

        vars.forEach(key => {
            env = utils.removePattern(env, `${key}=(.*)\n*`);
            if (!reset) env = `${env}\n${key}=${address}`;
        });

        fs.writeFileSync(path, env);

        return Promise.resolve();
    }

    return Promise.reject(`Unable to find and read ${path}`);
}

function manageGnome({ hostname, port, keys }, reset) {
    let commands = [
        utils.childExec(`gsettings reset ${GNOME_SETTINGS.mode}`),
        utils.childExec(`gsettings reset ${keys.host}`),
        utils.childExec(`gsettings reset ${keys.port}`)
    ];

    if (!reset) {
        commands = [
            utils.childExec(`gsettings set ${GNOME_SETTINGS.mode} 'manual'`),
            utils.childExec(`gsettings set ${keys.host} ${hostname}`),
            utils.childExec(`gsettings set ${keys.port} ${port}`)
        ];
    }

    return Promise.all(commands);
}

function manageWindows({ hostname, port }, reset) {
    const address = `${hostname}:${port}`;

    const { path, server, enable } = WINDOWS;

    if (!reset) {
        regedit.putValue({
            [path]: {
                [server.key]: {
                    value: address,
                    type: server.type
                }
            }
        }, err => {
            if (err) return Promise.reject(err);
        });

        regedit.putValue({
            [path]: {
                [enable.key]: {
                    value: 1,
                    type: enable.type
                }
            }
        }, err => {
            if (err) return Promise.reject(err);
        });

        return Promise.resolve();
    }

    regedit.putValue({
        [path]: {
            [server.key]: {
                value: '',
                type: server.type
            }
        }
    }, err => {
        if (err) return Promise.reject(err);
    });

    regedit.putValue({
        [path]: {
            [enable.key]: {
                value: 0,
                type: enable.type
            }
        }
    }, err => {
        if (err) return Promise.reject(err);
    });

    return Promise.resolve();
}