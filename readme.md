# Extract CSS Media Queries

[![npm version](https://badge.fury.io/js/%40elambro%2Fextract-css-media-queries.svg)](https://badge.fury.io/js/%40elambro%2Fextract-css-media-queries) [![GitHub version](https://badge.fury.io/gh/elambro%2Fextract-css-media-queries.svg)](https://badge.fury.io/gh/elambro%2Fextract-css-media-queries) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/elambro/extract-css-media-queries/graphs/commit-activity)




## Webpack plugin for extracting media queries from CSS files
Based on [https://github.com/mike-diamond/media-query-splitting-plugin]

This package extracts media queries (e.g. `@media (min-size: 768px) {...}`) from your CSS into separate stylesheets which you can use to lower package sizes for your mobile users.

The plugin will merge duplicate media query rules, ordered the rules from smallest to largest, and minify the output.

You can then load this larger stylesheet(s) through a `<link>` tag:

```html
<link rel="stylesheet" media="screen and (min-width: 768px)" href="/style.css">
```
or load it dynamically through your js.

## Install

```bash
`npm i -D @elambro/extract-css-media-queries`
```

## Usage

### webpack.config.js

```js
const ExtractCssMediaQueries = require('@elambro/extract-css-media-queries');

const options = {
  breakpoints: [
    {
      minWidth: 768,
      verbose : false, 
      minify  : true,
      combined: true,
      filename: `css/large.css`,
   }
 ]
}

module.exports = {
  plugins: [
    new ExtractCssMediaQueries(options)
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'css-loader',
        ]
      }
    ]
  }
};
````
This will extract all media queries with a min-width greater or equal to 768 and extract them to the `css/large.css` file

### Options

````js
let options = {
    breakpoints: {
        minWidth : 768,
        minHeight: 900
    },
    verbose    : false,
    minify     : false,
    filename   : 'css/[name]-desktop.css', 
    combined   : false,
    exclude    : null,
    include    : null,
}

// Will extract a file for each stylesheet. e.g. css/style.css => css/style-desktop.css

````

#### Groups

You can run separate options on different css files

````js
let options = {
    groups: [
      {
        // group1
        breakpoints:[1200]
        include    : 'example1.css',
        combined   : false
      },
      {
        // group2
        breakpoints:[768],
        exclude    : 'example1.css',
        combined   : true
      }
    ]
}

// group1 will extract media queries from example1.css and export as `example-1200.css`
// group2 will extract media queries from everything but example1.css and combined them into a file `extracted-768.css`

````

#### Exclude / Include

You can exclude or include input files for a group using the `include` and `exclude` properties. This will filter css files based on their input filename, using `filename.match(include)` and `!filename.match(exclude)`

#### Breakpoints

Specify breakpoints to extract into separate files. (Default is {minWidth: 768})
All media queries that are larger than the minWidth or larger than the minHeight will be extracted. Options `minify`, `combined`, `filename` and `verbose` can be used as an options property or as a breakpoint property.

E.g. 
````js
{
    breakpoints: [768, 1200],
    // or 
    breakpoints: [
      { 
        minify: true,
        minWidth: 500,
        combined: true,
        filename: 'css/style-[breakpoint].[ext]'
      },
      { 
        minify: true,
        minWidth: 800,
        combined: true,
        filename: 'css/style-[breakpoint].[ext]'
      },
    ]

// Will extract css/style-500.css and css/style-800.css.

}
````

#### Combined

Combine the extracted media queries into a single CSS file, or create an extracted CSS file for each individual input (Default is true).
When `{combined: false}`, you can use a `[name]` var in the `filename` option. e.g.

````js
{
  breakpoints: [1200],
  combined: false,
  filename: 'css/[name]-[breakpoint].[ext]' // css/style.css => css/style-1200.css
}

// OR

{
  breakpoints: [800, 1200],
  combined: true,
  filename: 'css/extracted-[breakpoint].[ext]' // css/style1.css + css/style2.css => css/extracted-800.css & css/extracted-1200.css
}
````

## Examples

`const options = {breakpoints:[567,767]}`

Will give you 3 files:
-  `style.css`       - Common style, with all media queries `@media (min-width: 567px)` and higher extracted out. 
- `style-767.css`  - Only media queries `@media(min-width: 767px)` and above. e.g. `@media(min-width: 800px)` is also included.
- `style-567.css` -  Only media queries `@media(min-width: 567px)` up to `@media(min-width: 767px)`

Duplicate media queries are merged in the results, then they're sorted with the highest `min-width` (and `min-height`) media queries at the bottom of the file. 

## Laravel Mix

Also see the [Laravel Mix extension](https://github.com/elambro/laravel-mix-extract-media-queries)