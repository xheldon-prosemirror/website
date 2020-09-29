var fs = require("fs")
var JSDOM = require('jsdom').JSDOM;
var Mold = require("mold-template")
var markdown = (require("markdown-it")({
  html: true,
  highlight: require("./highlight").highlight
})).use(require("markdown-it-deflist"))

module.exports = function loadTemplates(config) {
  var mold = new Mold(config.env || {})
  fs.readdirSync(config.dir).forEach(function(filename) {
    var match = /^(.*?)\.html$/.exec(filename)
    if (match)
      mold.bake(match[1], fs.readFileSync(config.dir + match[1] + ".html", "utf8").trim())
  })
  mold.defs.markdown = function(options) {
    if (typeof options == "string") options = {text: options}
    let md = options.text
    if (config.markdownFilter) md = config.markdownFilter(md)
    if (options.anchors) md = headerAnchors(md, options.anchors === true ? "" : options.anchors + ".")
    let html = markdown.render(md)
    if (options.shiftHeadings) html = html.replace(/<(\/?)h(\d)\b/ig, (_, cl, d) => "<" + cl + "h" + (+d + options.shiftHeadings))
    // NOTE: 将指南中的文档也翻译成中文。
    let dom = new JSDOM(html);
    let pArr = [...dom.window.document.querySelectorAll('p'),...dom.window.document.querySelectorAll('li')];
    pArr.forEach((p, key) => {
      // 以 @cn 开头的为翻译文件，将其前一个 p 的内容放到其 title 中并删除
      if (!p.textContent.indexOf('@cn')) {
        const prevP = pArr[key - 1];
        const enContent = prevP.textContent;
        prevP.remove();
        p.innerHTML = p.innerHTML.slice(3).trim();
        p.setAttribute('data-en', enContent);
        p.setAttribute('lang', 'cn');
      }
      if (!p.textContent.indexOf('@comment')) {
        p.innerHTML = '<span>注: </span>'+ p.innerHTML.slice(8).trim();
        p.setAttribute('type', 'comment');
      }
    });
    // NOTE: jsdom 会将出现在 md 文件顶部的 style 标签内的内容放到 head 中的 style 标签中
    return (dom.window.document.head.innerHTML || '') + dom.window.document.body.innerHTML;
  }
  mold.defs.markdownFile = function(options) {
    if (typeof options == "string") options = {file: options}
    options.text = fs.readFileSync(config.markdownDir + options.file + ".md", "utf8")
    return mold.defs.markdown(options)
  }
  return mold
}

function headerAnchors(str, prefix) {
  return str.replace(/((?:^|\n)#+ )(.*)/g, function(_, before, title) {
    var anchor = title.replace(/\s/g, "_").replace(/[^\w_]/g, "").toLowerCase()
    return before + "<a id=\"" + prefix + anchor + "\"></a>" + title
  })
}
