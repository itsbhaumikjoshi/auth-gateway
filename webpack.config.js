const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  target: "node",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.join(__dirname, "/bin"), to: path.join(__dirname, "/dist/bin") },
      ],
    })
  ],
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'ts-loader',
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  }
}