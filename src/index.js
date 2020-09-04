const handleApply = require('./handle-apply')

const parseOptions = (obj={}) => {
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
    this.options = parseOptions(options)
  }

  apply(compiler) {
      handleApply({compiler,...this.options})
  }
}
