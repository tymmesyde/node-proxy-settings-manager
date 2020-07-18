const LINUX_ENV = {
    path: `${process.env.HOME}/.profile`,
    http: ['http_proxy', 'HTTP_PROXY'],
    https: ['https_proxy', 'HTTPS_PROXY']
};

const GNOME_SETTINGS = {
    mode: `org.gnome.system.proxy mode`,
    http: {
        host: 'org.gnome.system.proxy.http host',
        port: 'org.gnome.system.proxy.http port'
    },
    https: {
        host: 'org.gnome.system.proxy.https host',
        port: 'org.gnome.system.proxy.https port'
    }
};

module.exports = {
    LINUX_ENV,
    GNOME_SETTINGS
};