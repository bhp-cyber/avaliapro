const fs = require("fs");
const path = require("path");

const entryFile = path.resolve(__dirname, "src/widget.entry.js");
const outputFile = path.resolve(__dirname, "widget.js");

if (!fs.existsSync(entryFile)) {
  console.error("[AvaliaPro] Arquivo de entrada não encontrado:", entryFile);
  process.exit(1);
}

const content = fs.readFileSync(entryFile, "utf8");

fs.writeFileSync(outputFile, content, "utf8");

console.log(
  "[AvaliaPro] widget.js gerado com sucesso a partir de widget/src/widget.entry.js"
);
