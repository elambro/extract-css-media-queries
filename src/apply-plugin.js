const {StyleRules, Breakpoint} = require('./classes')
const printMessage = require('print-message')

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

function getHash(str) {
  const hash = createHash('md4')
  hash.update(str)
  return hash.digest('hex').substr(0, 4)
}

function renameFile(filename, filecontents)
{
  return filename;

  // @todo

  const { util: { createHash } } = require('webpack')
  return 
    filename
    .replace('[ext]', 'css')
    .replace('[contenthash]', getHash(filecontents));
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
    files = {...files, ...newSheets}
  })

  var renamed = {};
  Object.keys(files).forEach(filename => {
    let contents = files[filename];
    renamed[ renameFile(filename, contents)] = contents;
  })

  return renamed;
}

module.exports = applyPlugin;