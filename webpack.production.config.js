var config = require('./webpack.config'),
    _ = require('lodash'),
    webpack = require('webpack');

module.exports = _.extend(
    _.clone(config),
    {
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                },
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin()
        ],
        devtool: 'none'
    }
);