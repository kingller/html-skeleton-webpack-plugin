const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const SkeletonWebpackPlugin = require('../index');
const args = require('node-args');

const target = `${__dirname}/dist`;

const ROOT_PATH = require('path').resolve(__dirname);

const mode = args.mode;

let config = {
    mode,
    entry: {},
    stats: 'errors-warnings',
    output: {
        path: target,
        filename: '[name].[hash:8].js',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                },
                exclude: /\/node_modules\//
            },
        ],
    },
    optimization: {
        runtimeChunk: {
            name: 'manifest',
        },
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            name: false,
            cacheGroups: {
                vendor: {
                    name: 'vendor',
                    chunks: 'initial',
                    priority: -10,
                    reuseExistingChunk: false,
                    test: /node_modules\/(.*)\.js[x]?/,
                },
                styles: {
                    name: 'styles',
                    test: /\.(less|css)$/,
                    minChunks: 1,
                    reuseExistingChunk: true,
                    enforce: true,
                },
            },
        },
    },
    plugins: [
        new CleanWebpackPlugin([target]),
    ],
};

function addEntries() {
    let pages = require('./pages.js');
    pages.forEach(function (page) {
        config.entry[page.name] = [`${ROOT_PATH}/src/${page.name}.jsx`];
        let plugin = new HtmlWebpackPlugin({
            filename: `${page.name}.html`,
            template: `${ROOT_PATH}/template.ejs`,
            chunks: ['manifest', 'vendor', page.name],
            name: page.name,
            title: page.title,
        });
        config.plugins.push(plugin);
    });
}
addEntries();

config.plugins.push(new SkeletonWebpackPlugin());

module.exports = config;
