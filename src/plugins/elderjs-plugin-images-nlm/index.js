const path = require('path');
const fs = require('fs-extra');

const defaultWidths = [1280, 992, 768, 576, 400, 350, 200];

const plugin = {
  name: 'elderjs-plugin-images-nlm',
  description: 'Resizes images. ',
  init: (plugin) => {
    if (plugin.config.widths.length === 0) {
      plugin.config.widths = defaultWidths;
    }
    // sort from bigger to smaller
    plugin.config.widths.sort((a, b) => b - a);
    return plugin;
  },
  config: {
    widths: [], // Sizes the images will be resized to.
    cssString: `.ejs-img-nlm {display: block;width: 100%;}
    .ejs-img-nlm img.lazy{width: 100%;display: block;}
    .ejs-img-nlm .placeholder{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: block;
      z-index:9;
      background-repeat: no-repeat;
      background-size: cover;
      background-color: white;
    }
    .blur-up {
      -webkit-filter: blur(1px);
      filter: blur(1px);
      transition: filter 400ms, -webkit-filter 400ms;
    }
    .blur-up.loaded {
      -webkit-filter: blur(0);
      filter: blur(0);
    }
    .placeholder {
      transition: opacity 400ms;
      opacity: 1;
    }
    .placeholder.loaded {
      opacity:0;
    }
    `,
    addVanillaLazy: true,
    vanillaLazyLocation: '/static/vanillaLazy.min.js', // vanillaLazy's location relative to the root of the site. The plugin will move it to your public folder for you.
  },
  shortcodes: [
    {
      shortcode: 'picture-nlm',
      run: ({ props, plugin, request }) => {
        const { src, ...opts } = {
          ...props,
        };

        if (!src) {
          throw new Error(`elderjs-plugin-images-nlm: picture shortcode requires src. ${JSON.stringify(request)}`);
        }

        if (!opts.title && opts.alt) {
          opts.title = opts.alt;
        }

        // maxWidth, the largest resolution this should ever display.
        const { maxWidth, class: classStr, alt, wrap } = { maxWidth: 2000, class: '', alt: '', ...opts };

        let picture = `<picture ${classStr ? `class="${classStr}"` : ''}>`;

        plugin.config.widths.forEach((size, i) => {
          if (size < maxWidth) {
            let source = `<source `;
            source += `data-srcset="${src}?w=${size}&nf_resize=fit" `;
            // offset: we must render an image with a resolution at least equal to the <img> width
            // so the min-width is the breakpoint coming right after
            // plugin.config.widths is sorted (descending) at init
            if (i + 1 < plugin.config.widths.length) {
              source += `media="(min-width: ${plugin.config.widths[i + 1]}px)" `;
            }
            source += `/>`;
            picture += source;
          }
        });

        picture += `<img data-src="${src}" ${alt.length > 0 ? ` alt="${alt}"` : ''} class="lazy blur-up">`;
        picture += `</picture>`;

        let pictureWithWrap = `<div class="ejs-img-nlm">${picture}</div>`;

        return pictureWithWrap;
      },
    },
  ],
  hooks: [
    {
      hook: 'stacks',
      name: 'addElderPluginImagesCss',
      description: 'Adds default css to the css stack',
      priority: 50,

      run: async ({ cssStack, plugin }) => {
        cssStack.push({
          source: 'elderPluginImages',
          string: plugin.config.cssString,
        });
        return {
          cssStack,
        };
      },
    },
    {
      hook: 'stacks',
      name: 'elderPluginImagesManagevanillaLazy',
      description: 'Adds vanillaLazy and makes sure it is in the public folder if requested by plugin.',
      priority: 2, // we want it to be as soon as possible
      run: async ({ customJsStack, plugin, settings }) => {
        if (plugin.config.addVanillaLazy) {
          //node_modules/vanilla-lazyload/dist/lazyload.min.js
          const vanillaLazyNodeModules = path.join(
            settings.rootDir,
            'node_modules',
            'vanilla-lazyload',
            'dist',
            'lazyload.min.js',
          );
          const vanillaLazyPublic = path.join(settings.distDir, plugin.config.vanillaLazyLocation);
          if (!fs.existsSync(vanillaLazyPublic)) {
            if (fs.existsSync(vanillaLazyNodeModules)) {
              fs.outputFileSync(vanillaLazyPublic, fs.readFileSync(vanillaLazyNodeModules, { encoding: 'utf-8' }));
            } else {
              throw new Error(`Unable to add vanillaLazy to public. Not found at ${vanillaLazyNodeModules}`);
            }
          }

          customJsStack.push({
            source: 'elderjs-plugin-images',
            string: `<script>
            function findAncestor (el, cls) {
              if(!cls) return false;
              while ((el = el.parentElement) && !el.classList.contains(cls));
              return el;
            }
            // window.lazyLoadOptions ={}
          var vanillaLazyLoad = document.createElement("script");
          vanillaLazyLoad.src = "${plugin.config.vanillaLazyLocation}";
          vanillaLazyLoad.rel = "preload";
          vanillaLazyLoad.onload = function() {
            var ll = new LazyLoad({
              callback_loaded: function (element) {
                var ejs = findAncestor(element, 'ejs-img-nlm');
                if(ejs){
                  var elements = ejs.getElementsByClassName("placeholder");
                  if(elements.length > 0){
                    elements[0].classList.add('loaded');
                  }
                }
              }
            });
          };
          document.getElementsByTagName('head')[0].appendChild(vanillaLazyLoad);
          
          </script>`,
            priority: 1,
          });
          return {
            customJsStack,
          };
        }
      },
    },
  ],
};

module.exports = plugin;
exports.default = plugin;
