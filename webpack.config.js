const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const path = require('path');
module.exports = {
    mode: "development",
    entry: {
        'main': './src/main.js',
        'maze': './src/maze.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/[name]/[name]-bundle.js',
    },

    module: {
        rules: [
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            esModule: false,
                        },
                    },
                ],
                type: 'javascript/auto'
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.vue']
    },

    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
        hot: true
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: '/public/index.html',
            filename: 'index.html',
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: '/public/maze.html',
            filename: 'maze.html',
            chunks: ['maze'],
        }),
        new VueLoaderPlugin()
    ]
}