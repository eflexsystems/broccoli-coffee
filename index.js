const Filter = require('broccoli-persistent-filter');
const coffeeScript = require('coffeescript');
const stringify = require('json-stable-stringify');

class CoffeeScriptFilter extends Filter {
  constructor(inputTree, options) {
    if (!options || typeof options !== 'object') {
      options = { persist: true };
    } else if (typeof options.persist === 'undefined') {
      options.persist = true;
    }

    super(inputTree, options);
    options = options || {}
    this.bare = options.bare;
    this.options = options;
    this.extensions = ['coffee', 'litcoffee', 'coffee.md'];
    this.targetExtension = 'js';
  }

  cacheKeyProcessString(string, relativePath) {
    return this.optionsHash() + super.cacheKeyProcessString(string, relativePath);
  }

  optionsHash() {
    if (!this._optionsHash) {
      this._optionsHash = stringify(this.options);
    }

    return this._optionsHash;
  }

  baseDir() {
    return __dirname;
  }

  processString(string, srcFile) {
    let coffeeScriptOptions = {
      bare: this.bare,
      literate: coffeeScript.helpers.isLiterate(srcFile)
    }

    try {
      return coffeeScript.compile(string, coffeeScriptOptions)
    } catch (err) {
      // CoffeeScript reports line and column as zero-indexed
      // first_line/first_column properties; pass them on
      err.line = err.location && ((err.location.first_line || 0) + 1)
      err.column = err.location && ((err.location.first_column || 0) + 1)
      throw err
    }
  }
}

module.exports = CoffeeScriptFilter
