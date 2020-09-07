const extractMediaQueries = require('extract-media-queries')

function parseGroupsFromOptions(options)
{
  // parse the options so that we can separate out the 
  // stylesheets into groups formatted in different ways
  let options = {groups=[], breakpoints=null, verbose = false, minify = false, filename = null, combined = true, exclude = null, include = null};
  
  // Push the options down into each group as defaults
  // If no groups, make a single group
  let groups = ( options.groups || [{breakpoints, verbose, minify, filename, combined, exclude, include}] )
  .map( group => ({
    breakpoints,
    verbose,
    minify,
    filename,
    combined,
    exclude,
    include,
    ...group
  }));

  return groups;
}

function filterAssetsForGroup(sheets, options)
{
  var res = {};
  
  Object.keys(sheets)
  .filter( name => {
    if (options.excluded && name.matches(options.excluded)) return false;
    if (options.included && !name.matches(options.included)) return false;
    return true;
  })
  .forEach(name => {
    res[name] = sheets[name]
  });

  return res;
}

function applyPlugin(sheets, options)
{
  let groups = parseGroupsFromOptions(options);
  var files = {};

  groups.forEach( groupOptions => {
    let subsheets = filterAssetsForGroup(sheets, groupOptions);
    let newSheets = extractMediaQueries(subsheets, groupOptions);
    files = {...files, }
  })

  return files;
}

module.exports = applyPlugin;