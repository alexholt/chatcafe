const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const precss = require('precss');
const Webpack = require('webpack');

const config = {
  entry: [
    './src/client/index.js',
    './src/client/styles/index.scss',
  ],
  output: {
    path: __dirname + '/public',
    filename: '/[name].js?h=[hash]'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loader: 'babel',
      include: path.resolve('./src')
    }, {
      test: /\.js$/,
      loader: 'babel',
      include: path.resolve('./src')
    }, {
      test: /\.scss$/,
      loader: 'style?singleton!css!postcss!sass'
    }, {
      test: /\.css$/,
      loader: 'style!css?sourceMap'
    }, {
      test: /\.(ico|png|jpg|gif)$/,
      loader: 'url?name=images/img-[hash:6].[ext]'
    }, {
      test: /\.md$/,
      loader: 'html!markdown'
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'svg-inline'
    }, {
      test: /\.html$/,
      loader: 'html'
    }],
  },
  babel: {
    presets: ['es2015', 'stage-0'],
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.scss', '.css'],
  },
  postcss: function () {
    return [precss, autoprefixer];
  },
  htmlLoader: {
    ignoreCustomFragments: [/\{\{.*}}/],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: 'head',
      template: '!!ejs!' + path.resolve('./src/index.html'),
      path: path.resolve('./public'),
      filename: 'index.html',
    }),
    new Webpack.EnvironmentPlugin(['NODE_ENV']),
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': (
        process.env.NODE_ENV === 'production' ?
        '"production"' :
        '"development"'
      ),
      'SERVER_URL': JSON.stringify(process.env.SERVER_URL),
    }),
  ],
};

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 8080;
  
  config.devServer = {
    contentBase: __dirname + '/public',
    host: 'localhost',
    port,
    publicPath: '/',
    hot: true,
    historyApiFallback: true
  };
  
  config.entry.push(
    require.resolve('webpack-dev-server/client') +
    `?http://localhost:${port}`
  );

  config.entry.push(
    require.resolve('webpack/hot/dev-server')
  );
  
  config.plugins.concat(new Webpack.HotModuleReplacementPlugin());
  
  config.devtool = 'source-map';
  config.debug = true;
}

module.exports = config;
