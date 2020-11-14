const subfont = require('subfont');

const plugin = {
  name: 'elderjs-plugin-subfont',
  description: `Subfont optimizes the use of Google fonts. This plugin makes it automatic for Elder sites`,
  init: (plugin) => {
    // this is a sync function that runs on plugin initialization.
    // if you need async, it is recommended that you extract the async logic to run on the 'bootstrap' hook.

    // Plugins have their own closure scope. This means that if you set:
    // plugin.init = true
    // you will have access to plugin.init in all of your hooks.
    // this data can be updated in hooks and will be persistent between page loads.

    // IMPORTANT: It is important to note that since builds are run across child processes,
    // the 'plugin' object is not consistent across all processes.

    // Plugins also get the build settings (plugin.settings) and the config (plugin.config) settings.

    return plugin;
  },
  hooks: [
    {
      hook: 'buildComplete',
      name: 'runSubfont',
      description: 'This is where it gets done',
      priority: 50,
      run: async ({ plugin, settings, ...args }) => {
        await subfont({
          root: settings.distDir,
          ...plugin.config,
        });
      },
    },
  ],
  config: {
    inPlace: true,
    inlineCss: true,
    silent: true,
  },
};

module.exports = plugin;
