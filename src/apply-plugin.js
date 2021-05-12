const {StyleRules, Breakpoint} = require('./classes')
const printMessage = require('print-message') // @todo replace with `chalk`
const createHash = require('webpack/lib/util/createHash');

function parseGroupsFromOptions(options)
{
  let defaults = {
    breakpoints: null,
    verbose    : false,
    minify     : false,
    filename   : null,
    combined   : true,
    exclude    : null,
    include    : null,
    ...options,
  };
  delete defaults.groups;

  // If no groups, make a single group
  // Push the options down into each group as defaults
  return ( options.groups || [defaults] ).map( group => ({...defaults, ...group}) )
}

function filterAssetsForGroup(sheets, options)
{
  var res = {};

  Object.keys(sheets)
  .filter( name => {
    if (options.exclude && name.match(options.exclude)) return false;
    if (options.include && !name.match(options.include)) return false;
    return true;
  })
  .forEach(name => {
    res[name] = sheets[name]
  });

  return res;
}

function getHash(str, len=6) {
  const hash = createHash('md4')
  hash.update(str)
  return hash.digest('hex').substr(0, len)
}

function renameFile(filename, asset, options={}, groupOptions={})
{
  const hash = groupOptions.hash || hash;

  if (hash) {

    // See https://github.com/scinos/webpack-plugin-hash-output/blob/master/src/OutputHash.js

    filename = filename.replace(/\\/g, '/');

    let hashTemplate = typeof hash === 'string' ? hash : `[name].[contenthash:8].js`;
    const REGEXP_CONTENTHASH = /\[contenthash(?::(\d+))?\]/i
    const REGEXP_NAME = /\[name\]/i

    let match = hashTemplate.match(REGEXP_CONTENTHASH);
    let hashStr = match ? match[0] : false;
    let hashLen = match ? match[1] : false;

    var dirs        = filename.split(`/`);
    var basename    = dirs.pop().replace('.css', '');
    var contents    = asset.source();
    var contenthash = hashStr ? getHash(contents, hashLen) : '';

    let newFilename = hashTemplate
    .replace('[name]',basename)
    .replace('[ext]', 'css')
    .replace(hashStr, contenthash)
    .replace(/^[\\/]|[\\/]$/g, '') // remove leading & trailing slashes

    return `${dirs.join(`/`)}/${newFilename}`;
  }

  return filename;

}

function extractMediaQueries(sheets, options)
{
  const breakpoints = Breakpoint.parse(options);
  var output = {...sheets};

  breakpoints.forEach( options =>
  {

    var combinedRules = [];

    // loops through sheets and pull out matching media queries
    Object.keys(output).forEach( cssFileName =>
    {

      let Original = StyleRules.fromStylesheet(output[cssFileName], options, cssFileName);

      let Extracted = Original.split()

      output[cssFileName] = Original.dedupe().sort()

      !options.combined
      ? output[Extracted.getFilename()] = Extracted.dedupe().sort()
      : combinedRules = [...combinedRules, ...Extracted.rules];

    });

    if (options.combined)
    {

      let Combined = new StyleRules(combinedRules, options);

      options.verbose && printMessage(['Extracting ' + combinedRules.length + ' rules to ' + Combined.getFilename()])

      output[Combined.getFilename()] = Combined.dedupe().sort()
    }

  })

  options.verbose && printMessage(['Exporting: ', `---------------------`, ...Object.keys(output)])

  let res = {};
  Object.keys(output).forEach(name => { res[name] = output[name].toStylesheet() });
  return res;
}

function applyPlugin(sheets, options)
{
  let groups = parseGroupsFromOptions(options);

  var files = {};

  groups.forEach( groupOptions => {
    let subsheets = filterAssetsForGroup(sheets, groupOptions);
    let newSheets = extractMediaQueries(subsheets, groupOptions);
    let existing  = Object.keys(subsheets);
    let renamed   = {};

    // Hash the names of any new sheets if needed
    Object.keys(newSheets).forEach(filename => {
      let asset = newSheets[filename];
      let name  = existing.includes(filename) ? filename : renameFile(filename, asset, options, groupOptions)
      renamed[name] = asset;
    })

    files = {...files, ...renamed}
  })

  return files;
}

module.exports = applyPlugin;