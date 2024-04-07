const path = require('path');
const mode = 'development';
const prod = mode === 'production';

module.exports = {
    entry: {
        mapcontrol: './src/mapcontrol.js',
        worldmap: './src/worldmap.js',
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
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