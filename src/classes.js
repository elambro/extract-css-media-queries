const {splitRulesByMinSize, mergeDuplicateRules, sortRulesBySize, rescue} = require('./utils')
const DEFAULT_MIN_WIDTH = 768;
const css = require('css');
const printMessage = require('print-message')
const createHash = require('webpack/lib/util/createHash');

class Breakpoint {
  constructor(options)
  {
    this.minHeight   = options.minHeight;
    this.minWidth    = options.minWidth;
    this.minify      = options.minify;
    this.verbose     = options.verbose;
    this.combined    = options.combined;
    this.filename    = options.filename;
    this.hash        = options.hash
  }

  static parse(options)
  {
    return (options.breakpoints||[{}]).map( bp => {

      let isNum = typeof bp === 'string' || typeof bp === 'number';
      let toNum = (n) => typeof n === 'number' ? n : n.match(/(\d+)/)[0];
      let w = isNum ? bp : bp.minWidth;
      let h = isNum ? null : bp.minHeight
      let local = isNum ? {} : bp;
      let combined = typeof local.combined === 'boolean' ? local.combined : options.combined;

      return new Breakpoint({
        minHeight: h ? toNum(h) : null,
        minWidth : w ? toNum(w) : (h ? null : DEFAULT_MIN_WIDTH),
        minify   : typeof local.minify === 'boolean' ? local.minify : options.minify,
        verbose  : typeof local.verbose === 'boolean' ? local.verbose : options.verbose,
        combined : typeof local.combined === 'boolean' ? local.combined : options.combined,
        filename : local.filename || options.filename,
        hash     : local.hash     || options.hash
      })
    })
  }

}

class StyleRules {

  constructor(rules, options, originalName)
  {
    this.rules        = rules;
    this.options      = options;
    this.originalName = originalName;
    this.rebuiltName  = null;
    this.contenthash  = null;
    this.hashedName   = null;
    this.hash         = null;
    this.fullhash     = null;
  }

  static fromStylesheet(sheet, options, name)
  {
    let rules = sheet instanceof StyleRules ? sheet.rules : css.parse(sheet).stylesheet.rules
    return new StyleRules(rules, options, name);
  }

  split()
  {
    let {common,extracted,results} = splitRulesByMinSize(this.rules, this.options.minWidth, this.options.minHeight);

    this.options.verbose
      && rescue( () => printMessage( results.length
        ? [`Matches from ${this.originalName} for {min-width: ${this.options.minWidth}, min-height: ${this.options.minHeight}}:`,
           `---------------------`,
           ...results]
        : [`No matches from ${cssFileName}`]))

    this.rules = common;

    return new StyleRules(extracted, this.options, this.originalName)
  }

  dedupe()
  {
    this.rules = mergeDuplicateRules(this.rules);
    return this;
  }

  sort()
  {
    this.rules = sortRulesBySize(this.rules)
    return this;
  }

  getFilename()
  {
    let w = this.options.minWidth;
    let h = this.options.minHeight;
    let bp = `${w}${h?`-${h}`:``}`;
    const trimSlashes = str => str.replace(/^\/|\/$/g, '') // .replace(/^[\\/]|[\\/]$/g, '') // Or like this?
    let template;

    if (this.options.combined) {
      // Not based on individual sheet name
      template = this.options.filename || `extracted-[breakpoint].[ext]`;

    } else {
      // Needs original filename

      let dirs = this.originalName.split(`/`); // .filter(v => v !== '.' && v !== '..');
      let basename = dirs.pop().replace('.css', '')
      let path = trimSlashes(dirs.join(`/`))
      template = (this.options.filename || `${path}/[name]-[breakpoint].[ext]`).replace('[name]', basename);

    }

    let res = template
    .replace('[breakpoint]', bp)
    .replace('[ext]', 'css')

    if (!res.endsWith('.css')) {
      res += '.css';
    }

    this.rebuiltName = res;

    return res;
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
      contents = (new CleanCSS().minify(contents)).styles
    }

    let buffer = new Buffer(contents);
    this.getHashedName(buffer);

    return {
      contents,
      contenthash: this.contenthash,
      hashedName : this.hashedName,
      hash       : this.hash,
      fullhash   : this.fullhash,
      original   : this.originalName || this.rebuiltName,
      size       : () => Buffer.byteLength(contents, 'utf8'),
      source     : () => buffer
    }


  }

  getHash(str, len=6) {
    this.hash = createHash('md4')
    this.hash.update(str)
    this.fullhash = this.hash.digest('hex');
    return this.fullhash.substr(0, len)
  }

  getHashedName(buffer)
  {
    let filename = this.originalName || this.rebuiltName;
    let pattern  = this.options.hash

    if (pattern) {

      // See https://github.com/scinos/webpack-plugin-hash-output/blob/master/src/OutputHash.js

      filename = filename.replace(/\\/g, '/');

      let hashTemplate = typeof pattern === 'string' ? pattern : `[name].[contenthash:8].js`;
      const REGEXP_CONTENTHASH = /\[contenthash(?::(\d+))?\]/i
      const REGEXP_NAME = /\[name\]/i

      let match = hashTemplate.match(REGEXP_CONTENTHASH);
      let hashStr = match ? match[0] : false;
      let hashLen = match ? match[1] : false;

      var dirs         = filename.split(`/`);
      var basename     = dirs.pop().replace('.css', '');
      this.contenthash = hashStr ? this.getHash(buffer, hashLen) : '';

      let newFilename = hashTemplate
      .replace('[name]',basename)
      .replace('[ext]', 'css')
      .replace(hashStr, this.contenthash)
      .replace(/^[\\/]|[\\/]$/g, '') // remove leading & trailing slashes

      this.hashedName = `${dirs.join(`/`)}/${newFilename}`;

    }

    return this;

  }

}

module.exports = {StyleRules, Breakpoint};