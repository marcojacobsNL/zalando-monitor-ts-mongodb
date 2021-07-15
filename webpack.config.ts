import webpack from 'webpack';
import NodemonPlugin from 'nodemon-webpack-plugin';
import NodeExternals from 'webpack-node-externals';
import Dotenv from 'dotenv-webpack';

const config: webpack.Configuration = {
  entry: './src/app.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.ts', '.json'],
  },
  externals: NodeExternals(),
  output: {
    path: __dirname + '/dist',
    filename: 'app.js',
  },
  plugins: [new NodemonPlugin(), new Dotenv()],
};

export default config;
