/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node',
  mode: 'development',
  entry: {
    extension: './src/extension.ts',
    'test/suite/index': './src/test/suite/index.ts',
    'test/runTest': './src/test/runTest.ts',
    'test/extension.test': './src/test/extension.test.ts' // Add this line
  },
  output: {
    path: __dirname + '/out',
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode',
    mocha: 'commonjs mocha',
    // Add these external packages to fix source map issues
    glob: 'commonjs glob',
    minimatch: 'commonjs minimatch',
    path: 'commonjs path',
    fs: 'commonjs fs',
    util: 'commonjs util'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      // Provide empty modules for Node.js specific modules when used in browser
      path: false,
      fs: false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  // Use ignoreWarnings instead of stats.warningsFilter (which is deprecated)
  ignoreWarnings: [
    /Failed to parse source map/
  ]
};

module.exports = config;