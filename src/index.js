const applyPlugin = require('./apply-plugin')

module.exports = class ExtractCssMediaQueriesPlugin {

  constructor(options, miniHashedPattern) {
    this.options = options
    this.hashed  = miniHashedPattern
    this.created = {};
  }

  setHashPattern(hashPattern) {
    this.options.hash = hashPattern;
    // if (this.options.breakpoints) {
    //   Object.values(this.options.breakpoints).forEach(opt => opt.hash = hashPattern)
    // }
  }

  apply(compiler) {

    const pluginName = ExtractCssMediaQueriesPlugin.name;
    const { webpack }     = compiler;
    const { Compilation } = webpack;
    const { RawSource, SourceMapSource, CachedSource, ReplaceSource } = webpack.sources;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
          // additionalAssets: true, //  run the provided callback again for assets added later by plugins.
        },
        (assets, callback) => {

          let sheets = {};

          Object.entries(assets)
            .filter(([pathname, asset]) => /\.css$/.test(pathname))
            .forEach(([pathname, asset]) => {

            // const assetInfo = compilation.assetsInfo.get(pathname);

            let child = asset.children && asset.children[0]
            let stylesheet = typeof asset.source === 'function' ? asset.source() : (child || asset)._value
            sheets[pathname] = asset.source()

          });

          let results = applyPlugin(sheets, this.options);

          Object.entries(results)
            .forEach(([pathname, asset]) => {

                // See https://github.com/webpack/webpack-sources
                // @todo How can we build a source map for the new files?

                let {contents,source,size,...assetInfo} = {...asset};
                let oldInfo  = compilation.assetsInfo.get(pathname);
                let original = assets[pathname];

                if (!original) {

                  compilation.emitAsset(pathname, new RawSource(source()), assetInfo);
                  this.created[asset.original] = pathname;

                } else {

                  let replace = new ReplaceSource(original, pathname);
                  replace.replace(0, original.source().length-1, contents);
                  compilation.updateAsset(pathname, replace, {...assetInfo, ...oldInfo});
                  return;

                }
            });


          callback()

        })
    })
  }

}
