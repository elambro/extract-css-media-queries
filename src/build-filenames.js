const { util: { createHash } } = require('webpack')

const DEFAULT_EXPORT_FILENAME = 'css/large.css';

// const REGEXP_CHUNKHASH = /\[chunkhash(?::(\d+))?\]/i
// const REGEXP_CONTENTHASH = /\[contenthash(?::(\d+))?\]/i
// const REGEXP_NAME = /\[name\]/i
const buildCombinedFilename = ({contents, options}) => {

  let {type,filename,combined} = options;
  let template = combined === true ? DEFAULT_EXPORT_FILENAME : combined;

  const replaceVars = (str) => str
    .replace('[type]', type||'')
    .replace('[ext]', 'css')
    .replace('[contenthash]', contenthash)
    .replace(/^\/|\/$/g, '')// remove leading and trailing slashes
  // .replace(/^[\\/]|[\\/]$/g, '') // Or like this?

  filename = replaceVars(template);

  if (!filename.endsWith('.css')) {
    filename += '.css';
  }
  return filename;

}

const buildFilename = ({contents, name, chunk, options}) => {
  
  let type     = common ? false : options.type || chunk
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

function getHash(str) {
  const hash = createHash('md4')
  hash.update(str)
  return hash.digest('hex').substr(0, 4)
}



module.exports = {buildCombinedFilename, buildFilename}
