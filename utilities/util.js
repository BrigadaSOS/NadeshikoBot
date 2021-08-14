const { decode } = require('html-entities');

module.exports = class Util {

static cleanAnilistHTML(html, removeLineBreaks = true) {
    let clean = html;
    if (removeLineBreaks) clean = clean.replace(/\r|\n|\f/g, '');
    clean = decode(clean);
    clean = clean
        .replaceAll('<br>', '\n')
        .replace(/<\/?i>/g, '*')
        .replace(/<\/?b>/g, '**')
        .replace(/~!|!~/g, '||');
    if (clean.length > 2000) clean = `${clean.substr(0, 1995)}...`;
    const spoilers = (clean.match(/\|\|/g) || []).length;
    if (spoilers !== 0 && (spoilers && (spoilers % 2))) clean += '||';
    return clean;
    
    }      
};
