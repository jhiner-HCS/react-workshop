const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const OpenBrowserWebpackPlugin = require("open-browser-webpack-plugin");

const subjectsDir = path.join(__dirname, "subjects");
const subjectDirs = fs
  .readdirSync(subjectsDir)
  .map(file => path.join(subjectsDir, file))
  .filter(file => fs.lstatSync(file).isDirectory());

module.exports = {
  devtool: "source-map",

  entry: subjectDirs.reduce(
    (entries, dir) => {
      const base = path
        .basename(dir)
        .replace(/\s/g, "-")
        .toLowerCase();

      if (fs.existsSync(path.join(dir, "exercise.js"))) {
        entries[base + "/exercise"] = path.join(dir, "exercise.js");
      }

      if (fs.existsSync(path.join(dir, "solution.js"))) {
        entries[base + "/solution"] = path.join(dir, "solution.js");
      }

      if (fs.existsSync(path.join(dir, "lecture.js"))) {
        entries[base + "/lecture"] = path.join(dir, "lecture.js");
      }

      return entries;
    },
    {
      shared: ["react", "react-dom"],
      index: path.join(subjectsDir, "index.js")
    }
  ),

  output: {
    path: "public",
    filename: "[name].js",
    chunkFilename: "[id].chunk.js",
    publicPath: "/"
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules|mocha-browser\.js/,
        loader: "babel"
      },
      { test: /\.css$/, loader: "style!css" },
      { test: /\.(ttf|eot|svg|png|jpg)$/, loader: "file" },
      {
        test: /\.woff(2)?$/,
        loader: "url?limit=10000&mimetype=application/font-woff"
      },
      { test: require.resolve("jquery"), loader: "expose?jQuery" }
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({ name: "shared" }),
    new OpenBrowserWebpackPlugin("http://localhost:8080")
  ],

  devServer: {
    quiet: false,
    noInfo: false,
    historyApiFallback: {
      rewrites: []
    },
    stats: {
      // Config for minimal console.log mess.
      assets: true,
      colors: true,
      version: true,
      hash: true,
      timings: true,
      chunks: false,
      chunkModules: false
    }
  }
};
