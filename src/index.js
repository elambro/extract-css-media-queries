const applyPlugin = require('./apply-plugin')

module.exports = class MediaQuerySplittingPlugin {

  constructor(options, miniHashedPattern) {
    this.options = options
    this.hashed  = miniHashedPattern
  }

  apply(compiler) {

    // const {webpack} = compiler;

    compiler.hooks.emit.tapAsync('emit', (compilation, callback) => {

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
      let names = Object.keys(sheets);

      Object.keys(results)
        .forEach( filename => {
          if (names.includes(filename)) {
            compilation.updateAsset(filename, results[filename]);
          } else {
            compilation.emitAsset(filename, results[filename]);
          }
        })

      callback()
   })
  }
}
