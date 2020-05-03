const path = require('path');

const getDirName = (p, name) => path.resolve(__dirname, '../', p.join('/'), name.replace(/\//g, '\\'));

const getFileName = (src) => {
    const nameMatch = src.match(/(?<=\.ru).+(?=\.png|jpg|gif)/g);
    const name = nameMatch ? nameMatch[0].replace(/\//g, '_') : src.slice(10, 20);

    return `${name}.png`;
}

module.exports = { getDirName, getFileName }