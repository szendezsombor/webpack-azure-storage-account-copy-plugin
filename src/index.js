"use strict";
exports.__esModule = true;
exports.ConsoleLogOnBuildWebpackPlugin = void 0;
var mime_types_1 = require("mime-types");
var storage_blob_1 = require("@azure/storage-blob");
var pluginName = 'AzureWebpackStorageAccountCopyPlugin';
var ConsoleLogOnBuildWebpackPlugin = /** @class */ (function () {
    function ConsoleLogOnBuildWebpackPlugin(options) {
        this.options = options;
    }
    ConsoleLogOnBuildWebpackPlugin.prototype.apply = function (compiler) {
        var sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(this.options.account, this.options.accountKey);
        var blobServiceClient = new storage_blob_1.BlobServiceClient("https://".concat(this.options.account, ".blob.core.windows.net"), sharedKeyCredential);
        var container = blobServiceClient.getContainerClient(this.options.container);
        compiler.hooks.afterEmit.tap(pluginName, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log(args);
        });
        compiler.hooks.afterCompile.tapAsync(pluginName, function (compilation, callback) {
            var chunks = compilation.chunks;
            var filesToUpload = [];
            console.log(chunks);
            chunks.forEach(function (chunk) {
                chunk.files.forEach(function (fileName) {
                    var asset = compilation.assets[fileName];
                    filesToUpload.push({
                        name: fileName,
                        content: asset.buffer() || new Buffer(asset.source().toString()),
                        fileType: (0, mime_types_1.lookup)(fileName) || 'text'
                    });
                });
                chunk.auxiliaryFiles.forEach(function (fileName) {
                    var asset = compilation.assets[fileName];
                    filesToUpload.push({
                        name: fileName,
                        content: asset.buffer() || new Buffer(asset.source().toString()),
                        fileType: (0, mime_types_1.lookup)(fileName) || 'text'
                    });
                });
            });
            var promises = filesToUpload.map(function (file) {
                compilation.logger.info("Uploading file with name ".concat(file.name, " with size of ").concat(file.content.length, " and with a type of ").concat(file.fileType));
                return container.getBlockBlobClient(file.name).upload(file.content, file.content.length, {
                    blobHTTPHeaders: {
                        blobContentType: file.fileType
                    }
                });
            });
            Promise.all(promises).then(function () {
                callback();
            });
        });
    };
    return ConsoleLogOnBuildWebpackPlugin;
}());
exports.ConsoleLogOnBuildWebpackPlugin = ConsoleLogOnBuildWebpackPlugin;
module.exports = ConsoleLogOnBuildWebpackPlugin;
