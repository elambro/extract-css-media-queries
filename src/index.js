const handleApply = require('./handle-apply')

const loadOptios = (obj={}) => {
  const {type="large", minify=false, filename=`[name].[ext]`, queries=[], verbose=false, combined=false} = obj
  return {
    queries,
    options: {
      type,
      minify,
      filename,
      verbose,
      combined
    }
  }
}

module.exports = class MediaQuerySplittingPlugin {

  constructor(options) {
    this.options = loadOptions(options)
  }

  apply(compiler) {
      handleApply({compiler,...this.options})
  }
}
