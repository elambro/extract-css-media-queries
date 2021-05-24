const {StyleRules, Breakpoint} = require('./classes')
const printMessage = require('print-message') // @todo replace with `chalk`

function parseGroupsFromOptions(options)
{
  let defaults = {
    hash       : null,
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

  // @todo How do we add in the source map?

  groups.forEach( groupOptions => {
    let subsheets = filterAssetsForGroup(sheets, groupOptions);
    let newSheets = extractMediaQueries(subsheets, groupOptions);
    let existing  = Object.keys(subsheets);
    let renamed   = {};

    // Use the hashed names as keys
    Object.entries(newSheets)
      .forEach(([pathname, asset]) => {
        asset.extracted = !existing.includes(pathname);
        let name = (asset.extracted ? asset.hashedName : asset.original ) || asset.original;
        asset.immutable = asset.extracted && name.includes(asset.contenthash);
        renamed[name] = asset;
      });

    files = {...files, ...renamed}
  })

  return files;
}

module.exports = applyPlugin;