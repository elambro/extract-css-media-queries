const splitByMediaQuery = require('./split-by-media-query')
const sortByMediaQuery = require('./sort-media-queries')

const printMessage = require('print-message');

const pluginName = 'neris-media-query-extract-plugin'

const { util: { createHash } } = require('webpack')

const DEFAULT_EXPORT_FILENAME = 'css/large.css';


const createStylesheet = ({compilation,contents,name}) => {
  compilation.assets[name] = {
    size  : () => Buffer.byteLength(contents, 'utf8'),
    source: () => new Buffer(contents)
  }
}

const getFileFromAsset = (asset) => {
    let child   = asset.children && asset.children[0]
    return typeof asset.source === 'function' ? asset.source() : (child || asset)._value
}

const getChunkFileName = ({contents, name, chunk, options}) => {
  
  let type = common ? false : options.type || chunk
  let id       = name.replace(/\..*/, '')
  let common   = type === 'common'
  let combined = options.combined;
  let template = options.filename;

  var dirs = name.split(`/`).filter(v => v !== '.' && v !== '..');
  var basename = dirs.pop().replace('.css', '');
  var contenthash = getHash(contents);

  // Make sure we don't overwrite the main file
  if (type && !template.includes('[type]')) {
    basename += (type?`-${type}`:'');
  }

  const replaceVars = (str) => str
    .replace('[type]', type||'')
    .replace('[id]', id)
    .replace('[name]', basename)
    .replace('[ext]', 'css')
    .replace('[contenthash]', contenthash)
    .replace(/^\/|\/$/g, '')// remove leading and trailing slashes
  // .replace(/^[\\/]|[\\/]$/g, '') // Or like this?

  var path  = replaceVars(dirs.join(`/`))
  var filename = replaceVars(template)

  // printMessage([
  //   `type: ${type}`,
  //   `template: ${template}`,
  //   `Basename: ${basename}`,
  //   `Filename: ${filename}`,
  //   `Dirname: ${path}`

  // ])

  if (!filename.endsWith('.css')) {
    filename += '.css';
  }

  return `${path}/${filename}`
}


// const REGEXP_CHUNKHASH = /\[chunkhash(?::(\d+))?\]/i
// const REGEXP_CONTENTHASH = /\[contenthash(?::(\d+))?\]/i
// const REGEXP_NAME = /\[name\]/i


function getHash(str) {
  const hash = createHash('md4')
  hash.update(str)
  return hash.digest('hex').substr(0, 4)
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

          let filename = getChunkFileName({contents,name,chunk,options});

          createStylesheet({compilation,contents,filename})
        
        } else {

          // Add the chunk to the combined data
          combinedContent.push(contents);

        }
      })
    })

    if (options.combined) {

      let name = options.combined === true ? DEFAULT_EXPORT_FILENAME : options.combined;

      // Here we need to sort smallest to biggest screen in the combined file
      // and merge the resulting media queries
      let contents = sortByMediaQuery(combinedContent);

      // Combine our media queries into one file
      options.verbose && printMessage([`Exporting combined and ordered media queries as ` + name]);

      // Add chunk to assets
      createStylesheet({compilation,contents,name})
    }

    callback()
  })
}


module.exports = handleApply
