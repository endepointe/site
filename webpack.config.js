'use strict';
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const mode = 'development';
const prod = mode === 'production';

module.exports = {
    entry: {
        bsmain: './src/js/main.js',
        mainmenucontrol: './src/js/mainmenucontrol.js',
        slidecontrol: './src/js/slidecontrol.js',
        mapcontrol: './src/js/mapcontrol.js',
        worldmap: './src/js/worldmap.js',
        graphcontrol: './src/js/graphcontrol.js',
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
