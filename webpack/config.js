const webpack = require('webpack');
const path = require('path');
const callsite = require('callsite');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin');
const {defaultsDeep} = require('lodash');

const DEFAULT_VENDORS = [
	'react',
	'react-dom',
	'ui-router-react',
	'ui-router-core',
	'ui-router-rx',
	'moment',
	'lodash',
	'ramda'
];

const DEFAULT_VENDORS_DEV = [
	'react-hot-loader/patch',
	'react-hot-loader'
];

module.exports = {
	DEFAULT_VENDORS,
	DEFAULT_VENDORS_DEV,

	buildConfig(appName, options = {}) {
		var stack = callsite();
		var caller = stack[1].getFileName();
		var context = path.dirname(caller);

		return defaultsDeep(options, {
			context,

			cache: true,

			entry: {
				vendor: [
					...DEFAULT_VENDORS,
					...DEFAULT_VENDORS_DEV
				],

				[appName]: [
					'./src/index.tsx'
				]
			},

			output: {
				path: path.join(context, 'dist'),
				filename: '[name].js',
				publicPath: '/'
			},

			resolve: {
				extensions: ['.ts', '.tsx', '.js']
			},

			plugins: [
				new webpack.NamedModulesPlugin(),

				new webpack.HotModuleReplacementPlugin(),

				new webpack.optimize.CommonsChunkPlugin({
					name: 'vendor',
					filename: 'vendor.bundle.js'
				}),

				new webpack.SourceMapDevToolPlugin({
					exclude: 'vendor',
					filename: '[name].js.map'
				}),

				new HtmlWebpackPlugin({
					template: './src/index.ejs',
					cache: false
				}),

				new StyleExtHtmlWebpackPlugin({
					minify: true
				})
			],

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
					use: [
						'style-loader',
						'css-loader'
					]
				}, {
					test: /^(?!.*\.inline).*\.less$/,
					use: [
						'style-loader',
						'css-loader',
						'less-loader'
					]
				}, {
					test: /\.inline\.less$/,
					loader: StyleExtHtmlWebpackPlugin.inline('less-loader')
				}]
			},

			devServer: {
				historyApiFallback: true,
				hot: true,
				host: "0.0.0.0",
				port: 8081,
				proxy: {
					'/api': 'http://localhost:8080'
				}
			}
		});
	}
};
