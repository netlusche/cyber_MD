const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({ html: true });
console.log(md.render('![image](data:image/png;base64,iVBORw0KGgo)'));
