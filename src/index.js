'use strict';

const types = require('./types');
const defaultsUtil = require('./util/defaults');
const bulk = require('bulk-require');

module.exports = {
    common: bulk(__dirname, './**/*.js').common,
    load: function (plugin) {
        types.add(plugin);
        
        function process(type, doc, content, customMetadata) {
            let filename = content.filename;
            let fileContent = getTextContent(content);

            const typeProcessor = types.getType(type);
            const arr = createFromJpath(doc, typeProcessor);
            const entry = typeProcessor.find(arr, filename);
            const property = typeProcessor.getProperty(filename, content);
            if (property === undefined) {
                throw new Error(`Could not get property of ${filename} (type ${type}`);
            }

            // process
            let metadata = typeProcessor.process(filename, fileContent);
            if(metadata.then) {
                return metadata.then(function(m) {
                    return goOn(m);
                });
            } else {
                return Promise.resolve(goOn(metadata));
            }

            function goOn(metadata) {
                metadata[property] = {
                    filename: getFilename(type, content.filename)
                };


                if (entry) {
                    Object.assign(entry, metadata, customMetadata);
                } else {
                    Object.assign(metadata, customMetadata);
                    arr.push(metadata);
                }

                return doc;
            }


        }

        function getType(type, doc, kind) {
            const typeProcessor = types.getType(type, kind);
            return getFromJpath(doc, typeProcessor);
        }

        function getFilename(type, filename) {
            var match = /[^\/]*$/.exec(filename);
            if (match) filename = match[0];
            const typeProcessor = types.getType(type);
            const jpath = typeProcessor.jpath;
            if (!jpath) throw new Error('No such type or no jpath');
            return jpath.concat(filename).join('/');
        }

        function getEmpty(kind, content) {
            const typeProcessors = types.getAllTypes(kind);
            if (!content) content = {};
            for (let i = 0; i < typeProcessors.length; i++) {
                createFromJpath(content, typeProcessors[i]);
            }

            return content;
        }

        function defaults(kind, content) {
            var empty = getEmpty(kind);
            defaultsUtil(true, content, empty);
            return content;
        }


        return {
            process, getType, getFilename, getEmpty, defaults
        };

        function createFromJpath(doc, typeProcessor) {
            const jpath = typeProcessor.jpath;
            if (!jpath) throw new Error('createFromJpath: undefined jpath argument');
            for (let i = 0; i < jpath.length; i++) {
                if (doc[jpath[i]] === undefined) {
                    if (i !== jpath.length - 1) {
                        doc[jpath[i]] = {};
                    } else {
                        doc[jpath[i]] = typeProcessor.getEmpty();
                    }
                }
                doc = doc[jpath[i]];
            }
            if (jpath.length === 0) {
                doc = Object.assign(doc, typeProcessor.getEmpty());
            }
            return doc;
        }

        function getFromJpath(doc, typeProcessor) {
            if (!doc) return;
            const jpath = typeProcessor.jpath;
            if (!jpath) throw new Error('getFromJpath: undefined jpath argument');
            for (let i = 0; i < jpath.length; i++) {
                if (doc[jpath[i]] === undefined) {
                    return undefined;
                }
                doc = doc[jpath[i]];
            }
            return doc;
        }

        function getTextContent(content) {
            switch (content.encoding) {
                case 'base64':
                    return atob(content.content);
                default:
                    return content.content;
            }
        }
    }
};