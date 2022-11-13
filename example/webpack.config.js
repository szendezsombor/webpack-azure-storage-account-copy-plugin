const path = require('path');
const AzureStorageAccountCopyPlugin = require('../src/index');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: path.join(__dirname, './src/index.js'),
    output: {
        filename: "[hash].js",
        path: path.join(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.png$/,
                type: 'asset/resource'
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin(),
        new AzureStorageAccountCopyPlugin({
            container: 'webpack-plugin-test',
            account: 'mogweudcesossstvm01',
            accountKey: 'PWSimj5CyfjBHrC4uD1Ko0iII++r+d0rb5/nhLSBDkJL3sH8EsZZIXOyt95OJRyrvGGAxfvvXWqn+AStiqtcMQ=='
        })
    ]
}