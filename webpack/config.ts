import * as webpack from 'webpack';
import { dirname, join } from 'path';
import * as callsite from 'callsite';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as StyleExtHtmlWebpackPlugin from 'style-ext-html-webpack-plugin';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import { defaultsDeep } from 'lodash';

export const DEFAULT_VENDORS = [
  'react',
  'react-dom',
  '@uirouter/react',
  '@uirouter/core',
  '@uirouter/rx',
  'moment',
  'lodash',
  'ramda'
];

export const DEFAULT_VENDORS_DEV = [
  'react-hot-loader/patch',
  'react-hot-loader'
];

export const buildConfig = (appName: string, options = {}) => {
  var isProd = process.argv.indexOf('-p') > -1;
  var stack = callsite();
  var caller = stack[1].getFileName();
  var context = dirname(caller);

  var entries = ['./src/index.tsx'];

  var plugins = [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => module.context && module.context.indexOf('node_modules') > -1
    }),

    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      cache: false
    }),

    new StyleExtHtmlWebpackPlugin({
      minify: true
    })
  ];

  if (isProd) {
    var styles = new ExtractTextPlugin('[name].css');
    plugins.push(styles);
  } else {
    plugins.push(
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin()
    );

    entries.unshift('react-hot-loader/patch');
  }

  return defaultsDeep(options, {
    context,

    cache: true,

    entry: {
      [appName]: entries
    },

    output: {
      path: join(context, 'dist'),
      filename: '[name].js',
      publicPath: '/'
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },

    plugins,

    module: {
      rules: [{
        // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
        test: /\.tsx?$/,
        use: [{
          loader: 'react-hot-loader/webpack'
        }, {
          loader: 'awesome-typescript-loader',
          options: {
            useBabel: true,
            useCache: true,
            babelOptions: {
              presets: ['es2015'],
              plugins: [
                ['import', {
                  'libraryName': 'antd',
                  'libraryDirectory': 'lib',
                  'style': 'css'
                }]
              ]
            }
          }
        }]
      }, {
        test: /\.css$/,
        use: isProd ? styles.extract([
          'css-loader'
        ]) : ['style-loader', 'css-loader']
      }, {
        test: /^(?!.*\.inline).*\.less$/,
        use: isProd ? styles.extract([
          'css-loader',
          'less-loader'
        ]) : ['style-loader', 'css-loader', 'css-loader']
      }, {
        test: /\.inline\.less$/,
        loader: StyleExtHtmlWebpackPlugin.inline('less-loader')
      }]
    },

    devServer: {
      historyApiFallback: true,
      hot: !isProd,
      host: "0.0.0.0",
      port: 8081,
      proxy: {
        '/api': 'http://localhost:8080'
      }
    }
  });
}
