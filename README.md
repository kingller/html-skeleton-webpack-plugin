# @pandora/skeleton-webpack-plugin
This webpack plugin is designed for generate the skeleton screen for page.

## Install

```bash
npm i -D @pandora/skeleton-webpack-plugin
``` 

## Usage

In your webpack configuration (`webpack.config.js`):

```javascript
const SkeletonWebpackPlugin = require('@pandora/skeleton-webpack-plugin');

module.exports = {
    //...
    plugins: [
        new SkeletonWebpackPlugin()
    ]
}
```

>   __NOTE__: You should add it after `html-webpack-plugin`


![skeleton screenshot](https://raw.githubusercontent.com/kingller/pandora-skeleton-webpack-plugin/master/example/images/screenshot.png)

## Options

### header
boolean. Default value is `true`.   
Whether to show the header.


### left
boolean. Default value is `true`.   
Whether to show the left.


### processHtml
string or RegExp or function. Default value is `/<!--\s*skeleton\s*-->/`.  
`<!-- skeleton -->` in html template will be replaced to skeleton screen code by default.


### css
string or function.  
Insert skeleton screen style. The default style will not be added when passing in this value.
