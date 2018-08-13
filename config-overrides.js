var path = require("path");
var CircularDependencyPlugin = require("circular-dependency-plugin");
var ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

function replacePlugin(config, type, builder) {
  return {
    ...config,
    plugins: config.plugins.map(p => {
      if (type.name === p.constructor.name) {
        return builder(p);
      } else {
        return p;
      }
    })
  };
}

function rewireWebpack(config, env) {
  return {
    ...config,
    plugins: [
      ...config.plugins,
      new CircularDependencyPlugin({
        // set the current working directory for displaying module paths
        cwd: process.cwd(),
        // exclude detection of files based on a RegExp
        exclude: /node_modules/,
        // add errors to webpack instead of warnings
        failOnError: true
      })
    ]
  };
}

module.exports = function override(config, env) {
  config = rewireWebpack(config, env);

  config = replacePlugin(
    config,
    ForkTsCheckerWebpackPlugin,
    existing =>
      new ForkTsCheckerWebpackPlugin({ ...existing.options, tslint: false })
  );

  return config;
};
