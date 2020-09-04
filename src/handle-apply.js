const splitByMediaQuery = require('./split-by-media-query')
const sortByMediaQuery = require('./sort-media-queries')
const {buildCombinedFilename, buildFilename} = require('./build-filenames')

const printMessage = require('print-message');

const pluginName = 'neris-media-query-extract-plugin'


const createStylesheet = ({compilation,contents,filename}) => {
  compilation.assets[filename] = {
    size  : () => Buffer.byteLength(contents, 'utf8'),
    source: () => new Buffer(contents)
  }
}

const getFileFromAsset = (asset) => {
    let child   = asset.children && asset.children[0]
    return typeof asset.source === 'function' ? asset.source() : (child || asset)._value
}


const handleApply = ({ compiler, queries, options }) => {

  compiler.plugin('emit', (compilation, callback) => {

    options.verbose && printMessage(['Extracting queries:', ...queries]);

    var combinedContent = [];

    Object.keys(compilation.assets)
    .filter((asset) => /\.css$/.test(asset))
    .forEach((name) => {

      // Split each css chunk 

      let cssFile  = getFileFromAsset(compilation.assets[name]);
      let sections = splitByMediaQuery({cssFile,queries,options,name})

      // Rename the parts and export

      Object.keys(sections).forEach((chunk) => {

        let contents = sections[chunk]

        if (chunk === 'common' || !combined) {

          let filename = buildFilename({contents,name,chunk,options});

          createStylesheet({compilation,contents,filename})
        
        } else {

          // Add the chunk to the combined data
          combinedContent.push(contents);

        }
      })
    })

    if (options.combined) {

      // Here we need to sort smallest to biggest screen in the combined file
      // and merge the resulting media queries
      let contents = sortByMediaQuery(combinedContent);

      let filename = buildCombinedFilename({contents,options})

      // Combine our media queries into one file
      options.verbose && printMessage([`Exporting combined and ordered media queries as ` + filename]);

      // Add chunk to assets
      createStylesheet({compilation,contents,filename})
    }

    callback()
  })
}


module.exports = handleApply
