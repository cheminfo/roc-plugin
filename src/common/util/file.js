'use strict';

const reg0 = /.*\/([^\/]*$)/;
const reg1 = /\.[0-9]+$/;
const reg2 = /(.*)\.(.*)/;

var fileUtil = module.exports = {};

fileUtil.getBasename = function (filename) {
    let base = filename.replace(reg0, '$1');
    return base.replace(reg1, '');
};

fileUtil.getExtension = function (filename) {
    let extension = fileUtil.getBasename(filename);
    return extension.replace(reg2, '$2').toLowerCase();
};


fileUtil.getFilename = function (typeEntry) {
    let keys = Object.keys(typeEntry);
    for (let i = 0; i < keys.length; i++) {
        if (typeEntry[keys[i]] && typeEntry[keys[i]].filename) {
            return typeEntry[keys[i]].filename;
        }
    }
};

fileUtil.basenameFind = function (typeEntries, filename) {
    let reference = fileUtil.getBasename(filename);

    return typeEntries.find(typeEntry => {
        return fileUtil.getBasename(fileUtil.getFilename(typeEntry)) === reference;
    });
};
