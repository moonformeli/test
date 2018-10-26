const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        main: "./src/main.js",
    },
    output: {
        filename: "[name]-bundle.js",
        path: path.resolve(__dirname, "../dist"),
    },
    mode: "development",
    devtool: "source-map",
    devServer: {
        contentBase: path.resolve(__dirname, "../dist")
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: "html-loader"
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(["dist"], {
            root: path.resolve(__dirname, "..")
        }),
        new HtmlWebpackPlugin({
            title: "d3-practice test",
            template: path.join(__dirname, "../public/index.html")
        })
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                test: /[\\/]node_modules[\\/]/,
                name: "vendors",
                chunks: "all"
            }
        }
    }
};