const fs = require('fs');
const utils = require('../utils');
const { LINUX_ENV } = require('../config');

function manageLinuxProxy({ protocol, hostname, port, type }, reset) {
    const path = LINUX_ENV.path;
    const vars = LINUX_ENV[type];
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

module.exports = {
    manageLinuxProxy
};