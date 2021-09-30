const path = require("path")

module.exports = {
    mode: 'development',
	entry: './src/index.ts',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{ test: /\.tsx?$/, loader: "ts-loader" },
			{
				test: /\.css$/,
				use: [
                    { loader: 'style-loader' },
					{ loader: 'css-loader' },
				],
			},
			{
				test: /\.(png|jpg|gif)$/,
				type: 'asset/inline',
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
		alias: {
			'@framework': path.resolve(__dirname, 'cubism/Framework/src')
		}
	},
	devtool: 'inline-source-map'
}