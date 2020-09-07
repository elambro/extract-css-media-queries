const {splitByMediaQuery, sortByMediaQuery}  = require('./split-by-media-query')
const {buildCombinedFilename, buildFilename} = require('./build-filenames')
const DEFAULT_MIN_WIDTH = 768;

function addToOutput({}) {
  let commonStylesheet = (new ExtractedSheet(common, options)).dedupe().sort().toStylesheet()

  let filename = buildFilename({contents: commonStylesheet,name: cssFileName, chunk: 'common', options});

  output[filename] = commonStylesheet;

  return 
}

function extractMediaQueries(sheets, options)
{
  const {breakpoints, verbose} = parseOptions(options);
  const output = {};

  breakpoints.forEach( options => {

      var combinedExtractedContent = [];

      // loops through sheets and pull out matching media queries
      sheets.forEach( cssFileName => {
        
        let cssFile  = sheets[cssFileName];

        let rules  = css.parse(cssFile).stylesheet.rules

        let {common, extracted, results} = extractMatchingQueries({rules, options});

        let commonStylesheet = (new ExtractedSheet(common, options)).dedupe().sort().toStylesheet()

        let filename = buildFilename({contents: commonStylesheet,name: cssFileName, chunk: 'common', options});

        output[filename] = commonStylesheet;

        if (options.combined) {
            combinedExtractedContent.push(contents);
        } else {

          let extractedStylesheet = (new ExtractedSheet(extracted, options)).dedupe().sort().toStylesheet()

          let filename = buildFilename({contents: extractedStylesheet,name: cssFileName, chunk: 'extracted', options});

          output[filename] = extractedStylesheet;
        
        }
      })

      if (options.combined) {

        let extractedStylesheet = (new ExtractedSheet(combinedExtractedContent, options)).dedupe().sort().toStylesheet()

          let filename = buildFilename({contents: combinedExtractedContent,name: cssFileName, chunk: 'extracted', options});

          output[filename] = extractedStylesheet;
      }

  if (options.verbose) {  
    try {
      results.length ? printMessage([`Matches from ${name}:`, ...results]) : printMessage([`No matches from ${name}`])
    } catch (err) {}
  }

  return buffered
}


  })

  return output;
  // return object of output filename => buffers
}













const parseOptions = (options={}) => {

  let {
    breakpoints=[],
    verbose,
    minify,
    filename,
    combined
  } = options;

  breakpoints = breakpoints.map( bp => {
    let isNum = typeof bp === 'string' || typeof bp === 'number';
    let toNum = (n) => n.match(/(\d+)/)[0];

    let w = isNum ? bp : bp.width;
    let h = isNum ? null : bp.height

    return {
      minHeight: h ? toNum(h) : null,
      minWidth :  w ? toNum(h) : (h ? null : DEFAULT_MIN_WIDTH),
      minify,
      verbose,
      combined,
      filename: bp.filename || `extracted-${w}${h?`-${h}`:``}`
    }
  })

  return {breakpoints,verbose}
}