const webpack = require('webpack');

module.exports = {
    entry: {
        clip: './src/js/clipper.js'
    },
    output: {
        path: './lib/',
        filename: '[name].js',
        publicPath: '/lib'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development')
            }
        })
    ],
    devtool: 'none',
    module: {
        loaders: [
            {
                test: /\.(es6|js)$/,
                exclude: /(node_modules|bower_components|bundles)/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', { plugins: ['babel-plugin-transform-object-rest-spread']}]
                }
            }
        ],
        noParse: [
            'react',
            'react-dom',
            'lodash',
            'bluebird'
        ]
    }
};