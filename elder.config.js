module.exports = {
  origin: process.env.URL || '', // TODO: update this.
  srcDir: 'src',
  distDir: 'public',
  rootDir: process.cwd(),
  build: {},
  server: {
    prefix: '',
  },
  debug: {
    stacks: false,
    hooks: false,
    performance: false,
    build: false,
    automagic: false,
  },
  hooks: {
    // disable: ['elderWriteHtmlFileToPublic'], // this is used to disable internal hooks. Uncommenting this would disabled writing your files on build.
  },
  plugins: {
    '@elderjs/plugin-markdown': {
      routes: ['blog'],
    },
    '@elderjs/plugin-browser-reload': {
      // this reloads your browser when nodemon restarts your server.
      port: 8080,
    },
    '@elderjs/plugin-images': {
      folders: [
        {
          src: '/images/*', // glob of where your original images are. Relative to rootDir/process.cwd() defined in your elder.config.js. Careful with **.
          output: '/images/', // where files should be put within the distDir defined in your elder.config.js.
        },
      ],
    },
    'elderjs-plugin-subfont': {},
  },
  shortcodes: { closePattern: '}}', openPattern: '{{' },
};
