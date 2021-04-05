const fs = require('fs');
const utils = require('../utils');
const { LINUX } = require('../config');

function manageLinuxProxy({ protocol, hostname, port, type }, reset) {
    const path = LINUX.path;
    const vars = LINUX[type];
    const address = `${protocol}://${hostname}:${port}`;
    console.log(path);
    console.log(vars);

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