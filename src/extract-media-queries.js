const DEFAULT_MIN_WIDTH = 768;



function extractMediaQueries(sheets, options)
{


  // return array of output filename => buffers
}













const parseOptions = (obj={}) => {

  const {breakpoints=[], minify=false, verbose=false} = obj;

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
      filename: bp.filename || `extracted-${w}${h?`-${h}`:``}`
      exclude : bp.exclude || []
    }
  })

  return {breakpoints,verbose}
}

const {splitByMediaQuery, sortByMediaQuery}  = require('./split-by-media-query')
const {buildCombinedFilename, buildFilename} = require('./build-filenames')