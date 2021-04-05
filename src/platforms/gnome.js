const utils = require('../utils');
const { GNOME } = require('../config');

function manageGnomeProxy({ hostname, port, type }, reset) {
    const keys = GNOME[type];

    let commands = [
        utils.childExec(`gsettings reset ${GNOME.mode}`),
        utils.childExec(`gsettings reset ${keys.host}`),
        utils.childExec(`gsettings reset ${keys.port}`)
    ];

    if (!reset) {
        commands = [
            utils.childExec(`gsettings set ${GNOME.mode} 'manual'`),
            utils.childExec(`gsettings set ${keys.host} ${hostname}`),
            utils.childExec(`gsettings set ${keys.port} ${port}`)
        ];
    }

    return Promise.all(commands);
}

module.exports = {
    manageGnomeProxy
};