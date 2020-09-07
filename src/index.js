const applyPlugin = require('./apply-plugin')

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
        .forEach( name => { 
          let asset = compilation.assets[name]
          let child = asset.children && asset.children[0]
          let stylesheet = typeof asset.source === 'function' ? asset.source() : (child || asset)._value
          sheets[name] = stylesheet; 
        });

      let results = applyPlugin(sheets, this.options);

      Object.keys(results)
        .forEach( filename => {
          compilation.assets[filename] = results[filename];
        })

      callback()
   })
  }
}
