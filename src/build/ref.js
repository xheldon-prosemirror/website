const {gatherMany} = require("getdocs-ts")
const {build, browserImports} = require("builddocs")
const {join} = require("path")
const {existsSync, readdirSync, readFileSync} = require("fs")
var builddocs = require("builddocs")
var JSDOM = require('jsdom').JSDOM;
var fs = require("fs")

var root = __dirname + "/../../node_modules/"
if (!existsSync(root + "prosemirror-model"))
  root = __dirname + "/../../../node_modules/"

var packages = ["state", "view", "model", "transform", "commands",
                "history", "collab", "keymap", "inputrules",
                "gapcursor", "schema-basic", "schema-list"]

function findMain(pkg) {
  let base = join(root, "prosemirror-" + pkg)
  let index = join(base, "src", "index.ts")
  return existsSync(index) ? index : join(base, "src", pkg + ".ts")
}

exports.buildRef = function buildRef() {
  if (process.env.NO_REF) return []

  function buildOptions(name) {
    return {
      name,
      anchorPrefix: name + ".",
      allowUnresolvedTypes: false,
      processType: type => {
        if ((type.type == "Node" || type.type == "Selection") && type.typeSource && /dom\.d\.ts/.test(type.typeSource))
          return {...type, type: "DOM" + type.type}
      },
      markdownOptions: {highlight: require("./highlight").highlight},
      breakAt: 45,
      imports: [type => {
        if (type.type == "OrderedMap") return "https://github.com/marijnh/orderedmap#readme"
        if (type.type == "DOMNode") return "https://developer.mozilla.org/en-US/docs/Web/API/Node"
        if (type.type == "DOMSelection") return "https://developer.mozilla.org/en-US/docs/Web/API/Selection"
        let sibling = /\.\.\/(?:prosemirror-)?([\w-]+)\//.exec(type.typeSource)
        if (sibling && packages.includes(sibling[1])) return "#" + sibling[1] + "." + type.type
      }, browserImports]
    }
  }

  let modules = packages.map(name => ({name, base: join(root, "prosemirror-" + name), main: findMain(name)}))

  let items = gatherMany(modules.map(mod => ({filename: mod.main, basedir: mod.base})))
  let nav = [{name: "Intro", href: "#top.intro"}]
  let output = modules.map((mod, i) => {
    let tocPart = {name: "prosemirror-" + mod.name, href: "#" + mod.name}
    nav.push(tocPart)
    let main = join(mod.main, "../README.md")
    let text = build({...buildOptions(mod.name), main: existsSync(main) ? main : null}, items[i])
    text = text.replace(/<h3>(.*?)<\/h3>/g, function(_, text) {
      let id = mod.name + "." + text.replace(/\W+/g, "_")
      if (!tocPart.sub) tocPart.sub = []
      tocPart.sub.push({name: text, href: "#" + id})
      return `<h3 id="${id}"><a href="#${id}">${text}</a></h3>`
    })

    let dom = new JSDOM(text);
  let pArr = [...dom.window.document.querySelectorAll('p')];
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
      p.innerHTML = '注:'+ p.innerHTML.slice(8).trim();
      p.style.fontSize = '14px';
      p.setAttribute('type', 'comment');
    }
  });

    return {
      name: mod.name,
      text: dom.window.document.body.innerHTML
    }
  })
  return {modules: output, nav}
}
// let output = modules.map(module => {
//   let tocPart = {name: "prosemirror-" + module.name, href: "#" + module.name}
//   toc.push(tocPart)
//   let text = builddocs.build({
//     name: module.name,
//     main: baseDir + "prosemirror-" + module.name + "/src/README.md",
//     imports: [{
//       constructor: false,
//       T: false,
//       this: false,
//       OrderedMap: "https://github.com/marijnh/orderedmap#readme",
//       "dom.ClipboardEvent": "https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent",
//       false: false,
//       true: false
//     }, ...importsFor(module)],
//     qualifiedImports: {
//       dom: builddocs.browserImports
//     },
//     templates: __dirname + "/../../templates/",
//     markdownOptions: {highlight: require("./highlight").highlight}
//   }, read[module.name]);
//   text = text.replace(/<h3>(.*?)<\/h3>/g, function(_, text) {
//     let id = module.name + "." + text.replace(/\W+/g, "_")
//     if (!tocPart.sub) tocPart.sub = []
//     tocPart.sub.push({name: text, href: "#" + id})
//     return `<h3 id="${id}"><a href="#${id}">${text}</a></h3>`
//   })
//   let dom = new JSDOM(text);
//   let pArr = [...dom.window.document.querySelectorAll('p')];
//   pArr.forEach((p, key) => {
//     // 以 @cn 开头的为翻译文件，将其前一个 p 的内容放到其 title 中并删除
//     if (!p.textContent.indexOf('@cn')) {
//       const prevP = pArr[key - 1];
//       const enContent = prevP.textContent;
//       prevP.remove();
//       p.textContent = p.textContent.slice(3);
//       p.setAttribute('data-en', enContent);
//       p.setAttribute('lang', 'cn');
//     }
//     if (!p.textContent.indexOf('@comment')) {
//       p.textContent = '注:'+ p.textContent.slice(8);
//       p.setAttribute('type', 'comment');
//     }
//   });
//   return {name: module.name, text: dom.window.document.body.innerHTML}
// })

// module.exports = {
//   modules: output,
//   nav: toc
// }
