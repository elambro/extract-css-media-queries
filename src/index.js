const handleApply = require('./handle-apply')

module.exports = class MediaQuerySplittingPlugin {

  constructor(options) {
    this.options = options
  }

  apply(compiler) {

    compiler.plugin('emit', (compilation, callback) => {

      // get stylesheets
      let sheets = {};
      
      Object.keys(compilation.assets)
        .filter((asset) => /\.css$/.test(asset))
        .forEach( name => { sheets[name] = compilation.assets[name]; });

      let results = applyPluginToSheets(sheets, this.options);

      Object.keys(results)
        .forEach( filename => {
          compilation.assets[filename] = results[filename];
        })

      callback()
   })
  }
}
