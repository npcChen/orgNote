var postcss = require('postcss');
module.exports = postcss.plugin('myplugin', function myplugin(options) {
    return function (root) {
        options = options || {}

        root.walkRules(function(rule) {
            console.log(rule)
            rule.walkDecls('font-size', function(decl, i){
                console.log(decl)
                console.log(decl.value)

                rule.append({ text: 'bollow are plugin added' }) 
                root.append({ name: 'charset', params: '"UTF-8"' });  // at-rule
                root.append({ selector: 'a' });                       // rule
                rule.append({ prop: 'color', value: 'black' });       // declaration

                root.append({ selector: '[data-dpr2]' + rule.selector, value: decl.value  })
            })
        })
    }
})

