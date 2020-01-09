const PLUGIN_NAME = "PandoraSkeletonWebpackPlugin";
const warn = msg => console.warn(`\u001b[33m[${PLUGIN_NAME}] ${msg}\u001b[39m`);
const error = msg => {
  console.error(`\u001b[31mERROR: [${PLUGIN_NAME}] ${msg}\u001b[39m`);
  throw new Error(msg);
};

class PandoraSkeletonWebpackPlugin {
  constructor(options = {}) {
    if (
      typeof options.addToHtml !== 'undefined' && 
      typeof options.addToHtml !== 'string' && 
      typeof options.addToHtml !== 'object' && 
      typeof options.addToHtml !== 'function'
    ) {
      warn("options.addToHtml expected to be string or RegExp or function!");
    }
    if (typeof options.css !== 'undefined' && typeof options.css !== 'string') {
      warn("options.css expected to be string!");
    }
    this._options = {
      addToHtml: options.addToHtml || /<!--\s*skeleton\s*-->/,
      css: options.css,
      htmlPluginName: options.htmlPluginName || 'html-webpack-plugin',
    };
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      // Hook into the html-webpack-plugin processing
      const onBeforeHtmlProcessing = (htmlPluginData, callback) => {
        const skeletonCss = `.pdr-page-head-skeleton {
    background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
    background-size: 400% 100%;
    -webkit-animation: pdr-page-skeleton-loading 1.4s ease infinite;
    animation: pdr-page-skeleton-loading 1.4s ease infinite;
  }
  .pdr-page-left-skeleton {
    height: 100%;
    background: linear-gradient(to bottom, #f2f2f2 65%, #ffff 65%, #ffff 100%);
    background-size: 100% 50px;
  }
  .pdr-page-content-skeleton {
    height: 100%;
    background:url(data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBoZWlnaHQ9IjE2IiB3aWR0aD0iNDAlIiB5PSI5LjEwOSIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsPSIjZjJmMmYyIi8+PHJlY3QgaGVpZ2h0PSIxNiIgd2lkdGg9IjEwMCUiIHk9IjUwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjAiIGZpbGw9IiNmMmYyZjIiLz48cmVjdCBoZWlnaHQ9IjE2IiB3aWR0aD0iMTAwJSIgeT0iODIiIGZpbGwtb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLW9wYWNpdHk9Im51bGwiIHN0cm9rZS13aWR0aD0iMCIgZmlsbD0iI2YyZjJmMiIvPjxyZWN0IGhlaWdodD0iMTYiIHdpZHRoPSI3MCUiIHk9IjExNiIgZmlsbC1vcGFjaXR5PSJudWxsIiBzdHJva2Utb3BhY2l0eT0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsPSIjZjJmMmYyIi8+PC9zdmc+);
  }
  @keyframes pdr-page-skeleton-loading {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }`;
      const skeletonHtml = `
  <div style="height: 100vh;">
    <div style="height: 55px;" class="pdr-page-head-skeleton"></div>
    <div style="height: calc(100vh - 55px);">
      <div style="float: left; width: 300px; height: 100%; padding: 20px;">
         <div class="pdr-page-left-skeleton"></div>
      </div>
      <div style="overflow: hidden; height: 100%; padding: 20px;">
        <div class="pdr-page-content-skeleton"></div>
      </div>
    </div>
  </div>
`;
        let { html } = htmlPluginData;
        let { css, addToHtml } = this._options;
        if (typeof css !== 'string') {
          css = skeletonCss;
        }
        html = html.replace(/<\/head>/, `<style type="text/css">
  ${css}
</style>
</head>`);
        if (typeof addToHtml === 'function') {
          html = addToHtml(html);
        } else {
          html = html.replace(addToHtml, skeletonHtml);
        }
        htmlPluginData.html = html;
        if (callback) {
          callback(null, htmlPluginData);
        } else {
          return Promise.resolve(htmlPluginData);
        }
      };

      if (compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing) {
        compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(PLUGIN_NAME, onBeforeHtmlProcessing);
      } else {
        const HtmlWebpackPlugin = require(this._options.htmlPluginName);
        if (HtmlWebpackPlugin.getHooks) {
          const hooks = HtmlWebpackPlugin.getHooks(compilation);
          const htmlPlugins = compilation.options.plugins.filter(plugin => plugin instanceof HtmlWebpackPlugin);
          if (htmlPlugins.length === 0) {
            const message = "Error running @pandora/skeleton-webpack-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
            error(message);
          }
          hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(PLUGIN_NAME, onBeforeHtmlGeneration);
        } else {
          const message = "Error running @pandora/skeleton-webpack-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
          error(message);
        }
      }
    });
  }
}

module.exports = PandoraSkeletonWebpackPlugin;
