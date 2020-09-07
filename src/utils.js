const printMessage = require('print-message')

const dump = (obj) => {
  printMessage([JSON.stringify(obj, null, 2)]);
}

function matchesQueryStrings({ media, queries=[], options })
{
  const escapeQuery = (query='') => query.replace(/:/g, ': ').replace(/,/g, ', ').replace(/  /g, ' ');

  let regexMedia   = escapeQuery(media || '')
  let regexQueries = (queries||[]).map(q => new RegExp( escapeQuery(q) ));
  return regexQueries.some( regex => regex.test(regexMedia));
}

/**
 * Extract the matching media queries from the array of rules
 * @param  {Array}  rules   [description]
 * @param  {Array}  queries [description]
 * @param  {Object} options [description]
 * @return {[type]}                 [description]
 */
function extractMatchingQueryStrings ({rules, queries, options})
{

  let common    = [];
  let extracted = [];
  let results   = [];

  rules.forEach( rule => {
    let { type, media } = rule;
    let isMedia = type === 'media';
    if (isMedia && matchesQueryStrings({ media, queries, options })) {
      extracted.push(rule)
      results.push(`✓ ${media}`);
    } else {
      common.push(rule)
      isMedia && results.push(`X ${media}`);
    }
  })
  return {common, extracted, results};
}

function sortBySize(a,b) 
{ 
  const bySizeVar = (a,b) => 
  {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
  return bySizeVar(a.width,b.width) || bySizeVar(a.height,b.height)
}

/**
 * Get min height and min width from a media rule
 * @param  {Object} rule 
 * @return {width,height}
 */
function parseMediaSize( rule )
{

  let {type, media} = rule;

  let size = {
    width: null, 
    height: null
  };

  const getInt   = str => str ? parseInt(str.replace( /(^.+\D)(\d+)(\D.+$)/i,'$2')) || null : null;
  const findSize = (arr,str) => getInt(arr.find(v => v.includes(str)));
  
  if (type === 'media') {
    let parts = media.split('and');
    size.width = findSize(parts, 'min-width')
    size.height = findSize(parts, 'min-height')  
  }

  return size;
}

function ruleIsBiggerThan(rule, minWidth, minHeight)
{
  let {width,height} = parseMediaSize(rule);
  return (width && width >= minWidth) || (height && height >= minHeight);
}

function splitRulesByMinSize(rules, width, height)
{
  let common    = [];
  let extracted = [];
  let results   = [];

  rules.forEach( rule => {
    if (ruleIsBiggerThan(rule, width, height)) {
      extracted.push(rule)
      results.push(`✓ ${rule.media}`);          
    } else {
      common.push(rule)
      rule.type === 'media' && results.push(`X ${rule.media}`);
    }
  })

  return {common,extracted,results}
}

 /**
 * Sort an array of rules by increasing media query size
 * @param  {Array} rules 
 * @return {Array}       
 */
function sortRulesBySize(rules)
{
  let mapped = rules.map( rule => ({rule, size: parseMediaSize(rule) }));
  mapped.sort(sortBySize)
  return mapped.map( obj => obj.rule );
}

/**
 * Merge duplicate CSS rules
 * @param  {Array} rules [description]
 * @return {Array}       [description]
 */
function mergeDuplicateRules(rules)
{
  var combined = [];
  rules.forEach(rule => {
    let { media, rules } = rule
    let i = combined.map(({ media }) => media).indexOf(media)
    if (!media || i < 0) {
      combined.push(rule)
    } else {
      combined[i].rules = combined[i].rules.concat(rules)
    }
  })
  return combined;
}

function rescue( fn )
{
  try {
    fn();
  } catch(Err) {}
}

module.exports = {splitRulesByMinSize, sortRulesBySize, mergeDuplicateRules, dump, rescue}