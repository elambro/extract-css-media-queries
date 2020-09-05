const css            = require('css')
const matchesQueries = require('./matches-queries')
const printMessage   = require('print-message');

const {ExtractSheetOptions, ExtractedSheet} = require('./extracted-sheet')

/**
 * Extract the matching media queries from the array of rules
 * @param  {Array}  rules   [description]
 * @param  {Array}  queries [description]
 * @param  {Object} options [description]
 * @return {[type]}                 [description]
 */
const extractMatchingQueries = ({rules, queries, options}) => {

  let common = [];
  let extracted = [];
  let results = [];

  rules.forEach( rule => {

    let { type, media } = rule;
    let isMedia = type === 'media';

    if (isMedia && matchesQueries({ media, queries, options })) {

      extracted.push(rule)
      results.push(`✓ ${media}`);

    } else {

      common.push(rule)
      isMedia && results.push(`X ${media}`);

    }
  })

  return {common, extracted, results};

}

const splitByMediaQuery = ({ cssFile, queries, options={}, name="chunk" }) => {

  const inputRules  = css.parse(cssFile).stylesheet.rules

  let {common, extracted, results} = extractMatchingQueries({rules: inputRules, queries, options});

  let buffered = {
    common   : (new ExtractedSheet(common, options)).dedupe().sort().toStylesheet(),
    extracted: (new ExtractedSheet(extracted, options)).dedupe().sort().toStylesheet()
  }

  if (options.verbose) {  
    try {
      results.length ? printMessage([`Matches from ${name}:`, ...results]) : printMessage([`No matches from ${name}`])
    } catch (err) {}
  }

  return buffered
}


module.exports = {sortByMediaQuery, splitByMediaQuery}
