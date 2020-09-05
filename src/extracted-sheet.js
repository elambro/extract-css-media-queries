
const bySizeVar = (a,b) => 
{
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

const sortBySize = (a,b) => 
{
  return bySizeVar(a.width,b.width) || bySizeVar(a.height,b.height)
}

/**
 * Get min height and min width from a media rule
 * @param  {Object} rule 
 * @return {width,height}
 */
const parseMediaSize = ( rule ) => {

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

class ExtractSheetOptions {
  constructor(options)
  {
    var {filename=null, width=768, height=null, minify: false} = options;

    this.filename  = filename || `extracted-${width}${height?`-${height}`:``}`;
    this.minWidth  = width;
    this.minHeight = height;
    this.minify    = minify;

  }
}

class ExtractedSheet {
  constructor(rules, options)
  {
    this.rules   = rules;
    this.options = new ExtractSheetOptions(options);
  }

  /**
   * Merge duplicate media conditions 
   * @return this
   */
  dedupe()
  {
    var combined = [];
    this.rules.forEach(rule => {
      let { media, rules } = rule
      let i = combined.map(({ media }) => media).indexOf(media)
      if (!media || i < 0) {
        combined.push(rule)
      } else {
        combined[i].rules = combined[i].rules.concat(rules)
      }
    })
    this.rules = combined;
    return this;
  }

 /**
 * Sort an array of rules by increasing media query size
 * @param  {Array} rules 
 * @return {Array}       
 */
  sort()
  {
    let mapped = this.rules.map((rule, index) => ({rule, size: parseMediaSize(rule) }));
    mapped.sort(sortBySize)
    this.rules = mapped.map( obj => obj.rule );
    return this;
  }

 /**
  * Create a stylesheet from the array of rules
  * @param  {Array} rules 
  * @return {String}      The contents of a stylesheet
  */
  toStylesheet()
  {
    let contents = css.stringify({
      type: 'stylesheet',
      stylesheet: {rules: this.rules},
    })

    if (this.options.minify) {
      const CleanCSS = require('clean-css')
      contents = (new CleanCSS().minify(style)).styles
    }

    return {
      size  : () => Buffer.byteLength(contents, 'utf8'),
      source: () => new Buffer(contents)
    }
  }


}

module.exports = {ExtractedSheet, ExtractSheetOptions};