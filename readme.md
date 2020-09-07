# Extract CSS Media Queries

## Webpack plugin for extracting media queries from CSS files
Based on [https://github.com/mike-diamond/media-query-splitting-plugin]

## Install

```bash
`npm i -D @elambro/extract-css-media-queries`
```

## Usage

### webpack.config.js

```js
const ExtractCssMediaQueries = require('@elambro/extract-css-media-queries');

module.exports = {
  plugins: [
    new ExtractCssMediaQueries({
      breakpoints: [{
        minWidth: 768,
        verbose : verbose, 
        minify  : mix.inProduction(),
        combined: true,
        filename: `css/large.css`,
     }]
    })
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

#### Breakpoints

Specify breakpoints to extract into separate files. (Default is {minWidth: 768})
All media queries that are larger than the minWidth or larger than the minHeight will be extracted.

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
