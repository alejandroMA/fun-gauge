'use strict';

var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const isProduction = !process.argv.find(v => v.includes('-d'));
var path = require('path');


let config = {
    entry: {
        index: './example/index.js'
    },
    output: {
        path: path.resolve('./example/js/'),
        filename: '[name].min.js',
        chunkFilename: '[name].chunk.min.js',
        // publicPath: '/js/'
        publicPath: 'js/'
    },
    plugins: [
        new CleanWebpackPlugin(['./example/js/']),
        // new webpack.optimize.ModuleConcatenationPlugin(),
        new BundleAnalyzerPlugin(),
        // new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /(node_modules|vendor)/,
                options: {
                    cacheDirectory: true
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        contentBase: path.resolve('./example'),
        publicPath: '/js/',
        compress: true,
        port: 5000,
        historyApiFallback: false,
        overlay: true,
        watchContentBase: true,
        // hot: true
    }
};


if (isProduction) {
    config.plugins.push(new UglifyJSPlugin({
        uglifyOptions: {
            ie8: false,
            warnings: false
        }
    }));
}



module.exports = config;
