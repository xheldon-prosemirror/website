var builddocs = require("builddocs")
var JSDOM = require('jsdom').JSDOM;
var fs = require("fs")

var modules = [{
  name: "state",
  deps: ["model", "transform", "view"]
}, {
  name: "view",
  deps: ["state"]
}, {
  name: "model"
}, {
  name: "transform",
  deps: ["model"]
}, {
  name: "commands",
  deps: ["state"]
}, {
  name: "history",
  deps: ["state"]
}, {
  name: "collab",
  deps: ["state"]
}, {
  name: "keymap",
  deps: ["state"]
}, {
  name: "inputrules",
  deps: ["state"]
}, {
  name: "gapcursor",
  deps: ["state"]
}, {
  name: "schema-basic",
  deps: ["model"]
}, {
  name: "schema-list",
  deps: ["state"]
}]

var baseDir = __dirname + "/../../node_modules/"
if (!fs.existsSync(baseDir + "prosemirror-model"))
  baseDir = __dirname + "/../../../node_modules/"

let read = Object.create(null)
modules.forEach(config => {
  let files = baseDir + "prosemirror-" + config.name + "/src/*.js"
  if (config.name == "transform") {
    // Move transform.js to the front when building the transform
    // module, to make sure methods added to the prototype later
    // appear after the base properties.
    let dir = files.slice(0, -4)
    let list = ["transform.js"].concat(fs.readdirSync(dir).filter(n => /\.js$/.test(n) && n != "transform.js"))
    files = list.map(n => dir + n).join(" ")
  }
  read[config.name] = builddocs.read({files})
})

let imports = Object.create(null)

function getImport(name) {
  let found = imports[name]
  if (!found) {
    found = imports[name] = Object.create(null)
    for (let prop in read[name].all)
      found[prop] = "#" + name + "." + prop
  }
  return found
}

function importsFor(mod) {
  let seen = Object.create(null), result = []
  function enter(name) {
    if (name in seen) return
    seen[name] = true
    let mod
    for (let i = 0; i < modules.length; i++)
      if (modules[i].name == name) mod = modules[i]
    if (mod.deps) mod.deps.forEach(enter)
    result.push(getImport(name))
  }
  if (mod.deps) mod.deps.forEach(enter)
  return result
}

let toc = [{name: "Intro", href: "#top.intro"}], output = modules.map(module => {
  let tocPart = {name: "prosemirror-" + module.name, href: "#" + module.name}
  toc.push(tocPart)
  let text = builddocs.build({
    name: module.name,
    main: baseDir + "prosemirror-" + module.name + "/src/README.md",
    imports: [{
      constructor: false,
      T: false,
      this: false,
      OrderedMap: "https://github.com/marijnh/orderedmap#readme",
      "dom.ClipboardEvent": "https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent",
      false: false,
      true: false
    }, ...importsFor(module)],
    qualifiedImports: {
      dom: builddocs.browserImports
    },
    templates: __dirname + "/../../templates/",
    markdownOptions: {highlight: require("./highlight").highlight}
  }, read[module.name]);
  text = text.replace(/<h3>(.*?)<\/h3>/g, function(_, text) {
    let id = module.name + "." + text.replace(/\W+/g, "_")
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
      p.textContent = p.textContent.slice(3);
      p.setAttribute('data-en', enContent);
      p.setAttribute('lang', 'cn');
    }
    if (!p.textContent.indexOf('@comment')) {
      p.textContent = '注:'+ p.textContent.slice(8);
      p.setAttribute('type', 'comment');
    }
  });
  return {name: module.name, text: dom.window.document.body.innerHTML}
})

module.exports = {
  modules: output,
  nav: toc
}
