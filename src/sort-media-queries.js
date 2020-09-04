const css          = require('css')
const printMessage = require('print-message');

function getQueryWidthFromRule( rule ) {
  // get intval from media query
  let {type, media} = rule;
  let size = null;
  if (type === 'media') {
    let parts = media.split('and');
    let str   = parts.find(v => v.includes('width') );
    size      = str ? parseInt(str.replace( /(^.+\D)(\d+)(\D.+$)/i,'$2')) || null : null
  }
  // printMessage(['Rule type ' + type + ' with media ' + media + ' has size ' + size],{border:false});
  return size;
}

const sortByMediaQuery = (cssFiles=[]) => {

  const output     = {}
  const ordered    = [];
  const nonordered = [];
  const results    = [];


  var sortedRules = [];
  var sizedRules = [];

  // Get an array of all the rules in all the sheets...
  cssFiles.forEach( cssFile => {

    let RulesWithSizes = css.parse(cssFile).stylesheet.rules.map( (rule, index) => ({
      rule,
      size: getQueryWidthFromRule(rule)
    }));

    // Get all rules as {rule: ..., size: size }
    sizedRules = [...sizedRules, ...RulesWithSizes];    
  })

  // Now sort them...
  
  sizedRules.sort( (a,b) => {

    if (a.size === null && b.size === null) {
      return 0;
    }

    if (a.size === null) {
      return -1;
    }

    if (b.size === null) {
      return 1;
    }

    if (a.size < b.size) {
      return -1;
    }

    if (a.size > b.size) {
      return 1;
    }

    return 0;

  })
  
  sortedRules = sizedRules.map( obj => obj.rule );

  // printMessage(['Got size rules sorted. Now combining them'], {border:false})

  // Merge duplicates media conditions
  var combinedRules = [];

  sortedRules.forEach(rule => {
      const { media, rules } = rule
      const mediaIndex = combinedRules.map(({ media }) => media).indexOf(media)
      if (!media || mediaIndex < 0) {
        combinedRules.push(rule)
      } else {
        combinedRules[mediaIndex].rules = combinedRules[mediaIndex].rules.concat(rules)
      }
  })

  // Stringify styles
  const style = css.stringify({
    type: 'stylesheet',
    stylesheet: { rules: combinedRules },
  })

  return style;
}


module.exports = sortByMediaQuery
