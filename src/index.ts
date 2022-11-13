import webpack, {Chunk, Compilation, Compiler} from "webpack";
import {lookup} from 'mime-types';
import {
    BlobServiceClient,
    BlockBlobUploadResponse,
    ContainerClient,
    StorageSharedKeyCredential
} from "@azure/storage-blob";

const pluginName = 'AzureWebpackStorageAccountCopyPlugin';
export type AzureStorageFile = { name: string, content: Buffer, fileType: string };

export class ConsoleLogOnBuildWebpackPlugin {

    constructor(private options: { account: string, accountKey: string, container: string }) {
    }

    apply(compiler: Compiler) {
        const sharedKeyCredential = new StorageSharedKeyCredential(this.options.account, this.options.accountKey);
        const blobServiceClient = new BlobServiceClient(
            `https://${this.options.account}.blob.core.windows.net`,
            sharedKeyCredential
        );
        const container: ContainerClient = blobServiceClient.getContainerClient(this.options.container);

        compiler.hooks.afterEmit.tap(pluginName, (...args: any[]) => {
            console.log(args);
        })

        compiler.hooks.afterCompile.tapAsync(pluginName, (compilation: Compilation, callback: any) => {
            const chunks: Set<Chunk> = compilation.chunks;
            const filesToUpload: AzureStorageFile[] = [];
            console.log(chunks);
            chunks.forEach((chunk: Chunk) => {
                chunk.files.forEach((fileName: string) => {
                    const asset = compilation.assets[fileName];
                    filesToUpload.push({
                        name: fileName,
                        content: asset.buffer() || new Buffer(asset.source().toString()),
                        fileType: lookup(fileName) || 'text',
                    });
                });

                chunk.auxiliaryFiles.forEach((fileName: string) => {
                    const asset = compilation.assets[fileName];
                    filesToUpload.push({
                        name: fileName,
                        content: asset.buffer() || new Buffer(asset.source().toString()),
                        fileType: lookup(fileName) || 'text',
                    });
                });
            });

            const promises: Promise<BlockBlobUploadResponse>[] = filesToUpload.map((file: AzureStorageFile) =>  {
                compilation.logger.info(`Uploading file with name ${file.name} with size of ${file.content.length} and with a type of ${file.fileType}`);
                return container.getBlockBlobClient(file.name).upload(file.content, file.content.length, {
                    blobHTTPHeaders: {
                        blobContentType: file.fileType,
                    }
                })
            })
            Promise.all(promises).then(() => {
                callback();
            });
        });
    }
}

module.exports = ConsoleLogOnBuildWebpackPlugin;