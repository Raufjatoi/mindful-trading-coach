import { readdirSync, writeFileSync, readFileSync } from "fs";

const assets = readdirSync("dist/client/assets");

// Main entry: the only index-*.js that contains Vite's module dep map
const js = assets.find(
  (f) =>
    /^index-.*\.js$/.test(f) &&
    readFileSync(`dist/client/assets/${f}`, "utf8").includes("__vite__mapDeps"),
);

const css = assets.find((f) => /^styles-.*\.css$/.test(f));

if (!js) {
  console.error("Could not find main entry JS in dist/client/assets/");
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MindCandle — Trade your mind, not the market</title>
    <link rel="icon" href="/icon.png" />
    ${css ? `<link rel="stylesheet" crossorigin href="/assets/${css}" />` : ""}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="/assets/${js}"></script>
  </body>
</html>`;

writeFileSync("dist/client/index.html", html);
console.log(`✓ Generated dist/client/index.html`);
console.log(`  js:  assets/${js}`);
console.log(`  css: assets/${css ?? "(none)"}`);
