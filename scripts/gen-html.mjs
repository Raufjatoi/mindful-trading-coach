import { readdirSync, writeFileSync, readFileSync } from "fs";

const assets = readdirSync("dist/client/assets");

const js = assets.find(
  (f) =>
    /^index-.*\.js$/.test(f) &&
    readFileSync(`dist/client/assets/${f}`, "utf8").includes("__vite__mapDeps"),
);

const css = assets.find((f) => /\.css$/.test(f));

if (!js) {
  console.error("Could not find main entry JS in dist/client/assets/");
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MindCandle — Trade your mind, not the market</title>
    <meta name="description" content="AI-powered trading psychology coach. Log trades, spot patterns, chat with Gemma 4 AI." />
    <link rel="icon" href="/icon.png" type="image/png" />
    <link rel="apple-touch-icon" href="/icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap" />
    ${css ? `<link rel="stylesheet" crossorigin href="/assets/${css}" />` : ""}
  </head>
  <body class="bg-background text-foreground antialiased">
    <div id="root"></div>
    <script type="module" crossorigin src="/assets/${js}"></script>
  </body>
</html>`;

writeFileSync("dist/client/index.html", html);
console.log(`✓ Generated dist/client/index.html`);
console.log(`  js:  assets/${js}`);
console.log(`  css: assets/${css ?? "(none)"}`);
