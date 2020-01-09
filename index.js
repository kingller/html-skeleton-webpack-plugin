const PLUGIN_NAME = "PandoraSkeletonWebpackPlugin";
const warn = msg => console.warn(`\u001b[33m[${PLUGIN_NAME}] ${msg}\u001b[39m`);
const error = msg => {
  console.error(`\u001b[31mERROR: [${PLUGIN_NAME}] ${msg}\u001b[39m`);
  throw new Error(msg);
};

class PandoraSkeletonWebpackPlugin {
  constructor(options = {}) {
    // if (typeof options.debug !== 'undefined' && typeof options.debug !== 'boolean') {
    //   warn("options.debug expected to be boolean!");
    // }
    this._options = {
      htmlPluginName: options.htmlPluginName || 'html-webpack-plugin',
    };
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      // Hook into the html-webpack-plugin processing
      const onBeforeHtmlProcessing = (htmlPluginData, callback) => {
        if (callback) {
          callback(null, htmlPluginData);
        } else {
          return Promise.resolve(htmlPluginData);
        }

        // Promise.all(assetPromises).then(
        //   () => {
        //     if (callback) {
        //       callback(null, htmlPluginData);
        //     } else {
        //       return Promise.resolve(htmlPluginData);
        //     }
        //   },
        //   (err) => {
        //     if (callback) {
        //       callback(err);
        //     } else {
        //       return Promise.reject(err);
        //     }
        //   }
        // );
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
