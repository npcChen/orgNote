const fs = require('fs');
const postcss = require('postcss');
const myplugin = require('./src/plugins/myplugin')();

fs.readFile('src/test.css', (err, css) => {
    postcss([myplugin])
        .process(css, { from: 'src/test.css', to: 'build/test.css' })
        .then(result => {
            fs.writeFile('build/test.css', result.css);
            if ( result.map ) fs.writeFile('build/test.css.map', result.map);
        });
});
