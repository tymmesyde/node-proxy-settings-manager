const { exec } = require('child_process');

module.exports.childExec = cmd => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error | stderr) return reject();
            resolve(stdout);
        });
    });
};

module.exports.removePattern = (string, pattern) => {
    const regex = new RegExp(pattern, 'g');
    const match = string.match(regex);
    if (match) match.forEach(m => string = string.replace(m, ''));
    return string;
};