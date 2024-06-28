'use strict';
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const mode = 'development';
const prod = mode === 'production';

module.exports = {
    entry: {
        slidecontrol: './src/slidecontrol.js',
        mapcontrol: './src/mapcontrol.js',
        worldmap: './src/worldmap.js',
        graphcontrol: './src/graphcontrol.js',
    },
    plugins: [
        new HtmlWebpackPlugin({template: './index.html'}),
    ],
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(css)$/,
                use: [
                    {loader: 'style-loader'},
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: true,
                        }

                    },
                ],
            },
            {
                test: /\.(scss)$/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                    {loader: 'postcss-loader', 
                        options: {
                            postcssOptions: {
                                plugins: [autoprefixer]
                            }
                        }
                    },
                    {loader: 'sass-loader'},
                ],
            },
        ],
    },
    mode,
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: false,
    }
}
