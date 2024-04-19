const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
        filename: "aframe-urdf.min.js"
    },
    devtool: 'source-map',
    mode: 'development',
    devServer: {
        port: process.env.PORT || 9000,
        hot: false,
        liveReload: true,
        static: {
            directory: 'examples'
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.INSPECTOR_VERSION': JSON.stringify(
                process.env.INSPECTOR_VERSION
            )
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ],
};