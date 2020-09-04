const css = require('css')

const parseScreenWidthFromRule = ( rule ) => {
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

const sortBySizeProp = (a,b) => {

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

}

const mergeDuplicateRules = (rules) => {
    // Merge duplicates media conditions
  var combined = [];

  rules.forEach(rule => {
      const { media, rules } = rule
      const mediaIndex = combined.map(({ media }) => media).indexOf(media)
      if (!media || mediaIndex < 0) {
        combined.push(rule)
      } else {
        combined[mediaIndex].rules = combined[mediaIndex].rules.concat(rules)
      }
  })

  return combined;
}

const stylesheetFrom = (rules) => {

  return css.stringify({
    type: 'stylesheet',
    stylesheet: { rules: combined },
  })
}

const rulesAsArray = (files) => {
  let rules = [];
  files.forEach(file => {
    rules = [...rules, ...css.parse(file).stylesheet.rules];
  })
  return rules;
}

const sortRulesBySize = (rules) => {

  let mapped = rules.map( (rule, index) => ({rule, size: parseScreenWidthFromRule(rule) }));
  
  mapped.sort(sortBySizeProp )
  
  return mapped.map( obj => obj.rule );
}

const sortByMediaQuery = (cssFiles=[]) => {

  let rules = rulesAsArray(cssFiles);

  let sorted = sortRulesBySize(rules);

  let combined = mergeDuplicateRules(sorted);

  return stylesheetFrom(combined);
}


module.exports = sortByMediaQuery
