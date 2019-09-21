const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var path = require("path");

module.exports = {
  mode: process.env.NODE_ENV,
  entry: "./src/index.tsx",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                includePaths: ["node_modules"]
              }
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].bundle.js"
  },
  plugins: [
    new MonacoWebpackPlugin({}),
    new HtmlWebpackPlugin({
      title: "JDDF Playground | Schema Language for JSON"
    })
  ]
};
