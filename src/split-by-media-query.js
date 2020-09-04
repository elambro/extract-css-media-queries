const css            = require('css')
const matchesQueries = require('./matches-queries')
const printMessage   = require('print-message');


const extractQueries = ({rules, queries, options}) => {

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

  const output      = {}
  const inputRules  = css.parse(cssFile).stylesheet.rules

  const results = [];

  let {common, extracted, results} = extractQueries({rules: inputRules, queries, options});

  let outputRules = {common, extracted};

  Object.keys(outputRules).forEach((key) => {

    output[key]      = []
    const rules      = outputRules[key]

    // printMessage(['Doing rules for ' + key])

    // Merge duplicates media conditions
    rules.forEach((rule) => {
      const { media, rules } = rule

      const mediaIndex = output[key].map(({ media }) => media).indexOf(media)

      if (!media || mediaIndex < 0) {
        output[key].push(rule)
      }
      else {
        output[key][mediaIndex].rules = output[key][mediaIndex].rules.concat(rules)
      }
    })

    // Stringify styles
    const style = css.stringify({
      type: 'stylesheet',
      stylesheet: { rules: output[key] },
    })

    // Minify styles
    if (options.minify) {
      const CleanCSS = require('clean-css')
      output[key]    = (new CleanCSS().minify(style)).styles
    }
    else {
      output[key] = style
    }
  })

  if (options.verbose) {  
    try {
      results.length ? printMessage([`Matches from ${name}:`, ...results]) : printMessage([`No matches from ${name}`])
    } catch (err) {}
  }

  return output
}


module.exports = splitByMediaQuery
