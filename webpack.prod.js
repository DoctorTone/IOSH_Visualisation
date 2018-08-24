const webpack = require("webpack");
const path = require("path");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');

let cleanOptions = {
    root: "./dist",
    verbose: true
};

module.exports = {
    mode: "production",
    entry: "./src/js/index.js",
    plugins: [
        new CleanWebpackPlugin(["dist"]),
        new HtmlWebpackPlugin({
            title: "IOSH Visualisation",
            template: "./IOSHVis.html",
            hash: true
        }),
        new CopyWebpackPlugin([
            { from: "./src/images", to: "./images" },
            { from: "./src/models", to: "./models" }
        ]),
        new UglifyJSPlugin({
            sourceMap: true
        }),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production")
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    "file-loader"
                ]
            }
        ]
    },
    output: {
        filename: "js/bundle.js",
        path: path.resolve(__dirname, "dist")
    }
};
