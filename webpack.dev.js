const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

let cleanOptions = {
    root: "./dist",
    verbose: true
};

module.exports = {
    mode: "development",
    entry: "./src/js/index.js",
    devtool: "inline-source-map",
    devServer: {
        contentBase: "./src"
    },
    plugins: [
        new CleanWebpackPlugin(["dist"]),
        new HtmlWebpackPlugin({
            title: "IOSH Visualisation",
            template: "./IOSHVis.html"
        })
    ],
    module: {
        rules: [
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
            },
            {
                test: /\.txt$/,
                use: [
                    "raw-loader"
                ]
            }
        ]
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist")
    }
};
