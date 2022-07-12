'use strict';

const PLUGIN_NAME = 'HtmlSkeletonWebpackPlugin';
const warn = (msg) => console.warn(`\u001b[33m[${PLUGIN_NAME}] ${msg}\u001b[39m`);
const error = (msg) => {
    console.error(`\u001b[31mERROR: [${PLUGIN_NAME}] ${msg}\u001b[39m`);
    throw new Error(msg);
};

class HtmlSkeletonWebpackPlugin {
    constructor(options = {}) {
        this._options = {
            processHtml: /<!--\s*skeleton\s*-->/,
            css: undefined,
            header: true,
            left: true,
            htmlPluginName: options.htmlPluginName || 'html-webpack-plugin',
        };
        if (typeof options.processHtml !== 'undefined') {
            if (
                typeof options.processHtml !== 'string' &&
                typeof options.processHtml !== 'object' &&
                typeof options.processHtml !== 'function'
            ) {
                warn('options.processHtml expected to be string or RegExp or function!');
            } else {
                this._options.processHtml = options.processHtml;
            }
        }
        if (typeof options.css !== 'undefined') {
            if (typeof options.css !== 'string' && typeof options.css !== 'function') {
                warn('options.css expected to be string or function!');
            } else {
                this._options.css = options.css;
            }
        }
        if (typeof options.header !== 'undefined') {
            if (typeof options.header !== 'boolean') {
                warn('options.header expected to be boolean!');
            } else {
                this._options.header = options.header;
            }
        }
        if (typeof options.left !== 'undefined') {
            if (typeof options.left !== 'boolean') {
                warn('options.left expected to be boolean!');
            } else {
                this._options.left = options.left;
            }
        }
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            // Hook into the html-webpack-plugin processing
            const onBeforeHtmlProcessing = (htmlPluginData, callback) => {
                let { css, header, left, processHtml } = this._options;

                const skeletonHeaderHtml = `
    <div style="height: 55px;" class="pdr-page-head-skeleton"></div>`;
                const skeletonLeftHtml = `
      <div style="float: left; width: 300px; height: 100%; padding: 20px 20px 0;">
        <div class="pdr-page-left-skeleton"></div>
      </div>`;
                const skeletonHtml = `
  <div style="height: 100vh;">${header ? skeletonHeaderHtml : ''}
    <div style="height: ${header ? 'calc(100vh - 55px)' : '100%'};">${left ? skeletonLeftHtml : ''}
      <div style="overflow: hidden; height: 100%; padding: 20px 20px 0;">
        <div class="pdr-page-content-skeleton"></div>
      </div>
    </div>
  </div>
`;
                let { html } = htmlPluginData;
                if (typeof css !== 'string') {
                    const skeletonHeaderCss = `.pdr-page-head-skeleton {
    background: #eff2f8;
    background-size: 400% 100%;
    -webkit-animation: pdr-page-skeleton-loading 1.4s ease infinite;
    animation: pdr-page-skeleton-loading 1.4s ease infinite;
  }
  `;
                    const skeletonHeaderAnimation = `@keyframes pdr-page-skeleton-loading {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }
  `;
                    const skeletonLeftCss = `.pdr-page-left-skeleton {
    height: 100%;
    background: linear-gradient(to bottom, #eff2f8 65%, #ffff 65%, #ffff 100%);
    background-size: 100% 50px;
  }
  `;
                    const skeletonContentCss = `.pdr-page-content-skeleton {
    height: 100%;
    background:url(data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IGhlaWdodD0iMTYiIHdpZHRoPSI0MCUiIHk9IjkiIGZpbGw9IiNlZmYyZjgiIC8+CiAgICA8cmVjdCBoZWlnaHQ9IjE2IiB3aWR0aD0iMTAwJSIgeT0iNTAiIGZpbGw9IiNlZmYyZjgiIC8+CiAgICA8cmVjdCBoZWlnaHQ9IjE2IiB3aWR0aD0iMTAwJSIgeT0iODIiIGZpbGw9IiNlZmYyZjgiIC8+CiAgICA8cmVjdCBoZWlnaHQ9IjE2IiB3aWR0aD0iNzAlIiB5PSIxMTYiIGZpbGw9IiNlZmYyZjgiIC8+Cjwvc3ZnPg==);
  }
  `;

                    let generatedCss = '';
                    if (header) {
                        generatedCss += skeletonHeaderCss;
                    }
                    if (left) {
                        generatedCss += skeletonLeftCss;
                    }
                    generatedCss += skeletonContentCss;
                    if (header) {
                        generatedCss += skeletonHeaderAnimation;
                    }
                    generatedCss = generatedCss.replace(/\s*$/, '');
                    if (typeof css === 'function') {
                        css = css(generatedCss);
                    } else {
                        css = generatedCss;
                    }
                }
                if (css) {
                    html = html.replace(
                        /\n*([ \t]*)<\/head>/,
                        `
<style type="text/css">
  ${css}
</style>
$1</head>`
                    );
                }
                if (typeof processHtml === 'function') {
                    html = processHtml(html, skeletonHtml);
                } else {
                    html = html.replace(processHtml, skeletonHtml);
                }
                htmlPluginData.html = html;
                if (callback) {
                    callback(null, htmlPluginData);
                } else {
                    return Promise.resolve(htmlPluginData);
                }
            };

            if (compilation.hooks.afterTemplateExecution) {
                compilation.hooks.afterTemplateExecution.tapAsync(PLUGIN_NAME, onBeforeHtmlProcessing);
            } else {
                const HtmlWebpackPlugin = require(this._options.htmlPluginName);
                if (HtmlWebpackPlugin.getHooks) {
                    const hooks = HtmlWebpackPlugin.getHooks(compilation);
                    const htmlPlugins = compilation.options.plugins.filter(
                        (plugin) => plugin instanceof HtmlWebpackPlugin
                    );
                    if (htmlPlugins.length === 0) {
                        const message =
                            "Error running html-skeleton-webpack-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
                        error(message);
                    }
                    hooks.afterTemplateExecution.tapAsync(PLUGIN_NAME, onBeforeHtmlProcessing);
                } else {
                    const message =
                        "Error running html-skeleton-webpack-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
                    error(message);
                }
            }
        });
    }
}

module.exports = HtmlSkeletonWebpackPlugin;
