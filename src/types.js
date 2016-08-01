'use strict';

const defaults = require('./util/defaults');
var lib = {
    types: {
        default: require('./types/default')
    }
};

module.exports = {
    add(l) {
        defaults(true, lib, l);
    },

    getType(type, kind, custom) {
        if(kind) {
            if(lib.types[kind][type]) {
                return Object.assign({}, lib.types.default, lib.types[kind].default, lib.types[kind][type], custom);
            }
        } else {
            for(var kind in lib.types) {
                if(lib.types[kind][type]) {
                    return Object.assign({}, lib.types.default, lib.types[kind].default, lib.types[kind][type], custom);
                }
            }
        }

        return Object.assign({}, lib.types.default);
    },

    getAllTypes(kind, custom) {
        var all = [];

        for(var type in lib.types[kind]) {
            if(type !== 'default') {
                all.push(module.exports.getType(type, kind, custom));
            }
        }
        return all;
    }
};