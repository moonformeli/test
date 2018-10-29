const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const devPort = 9090;

module.exports = {
    entry: {
        main: "./src/js/main.js"
    },
    output: {
        filename: "[name]-bundle.js",
        path: path.resolve(__dirname, "../dist")
    },
    mode: "development",
    devServer: {
        contentBase: path.join(__dirname, "../dist"),
        port: devPort
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.(html)$/,
                use: [{ loader: "html-loader" }]
            },
            {
                test:/\.css$/,
                use: [
                    "style-loader", "css-loader"
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{ loader: "file-loader" }]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(["dist"], {
            root: path.join(__dirname, "..")
        }),
        new HtmlWebpackPlugin({
            title: "TEST",
            template: path.resolve(__dirname, "../public/index.html")
        })
    ]
};