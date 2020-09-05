const extractMediaQueries = require('extract-media-queries')

function parseGroupsFromOptions(options)
{
  // parse the options so that we can separate out the 
  // stylesheets into groups formatted in different ways
  let options = {groups=[], breakpoints=null, verbose = false, minify = false, filename = null, combined = true, exclude = null, include = null};
  
  // Push the options down into each group as defaults
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

function filterAssetsForGroup(assets, options)
{
  let res = {};
  let allowed = Object.keys(assets).filter( name => {
    if (options.excluded && name.matches(options.excluded)) return false;
    if (options.included && !name.matches(options.included)) return false;
    return true;
  })
  allowed.forEach(name => {
    let asset = assets[name]
    let child   = asset.children && asset.children[0]
    let stylesheet = typeof asset.source === 'function' ? asset.source() : (child || asset)._value
    res[name] = stylesheet;
  });
  return res;
}

function applyPlugin(assets, options)
{
  let groups = parseGroupsFromOptions(options);
  let files = {};

  groups.forEach( groupOptions => {

    let subsheets = filterAssetsForGroup(assets, groupOptions);
    let newSheets = extractMediaQueries(subsheets, groupOptions);
    files = {...files, }
  })

  return files;
}

module.exports = applyPlugin;