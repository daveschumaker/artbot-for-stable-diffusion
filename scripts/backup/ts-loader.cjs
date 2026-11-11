const ts = require('typescript')
module.exports = function (source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext
    }
  }).outputText
}
