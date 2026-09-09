const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const NODE_MODULES = path.join(ROOT, "node_modules");

const SHIMS = {
  "client-only": {
    "package.json": JSON.stringify(
      {
        name: "client-only",
        version: "0.0.1",
        description: "Shim for styled-jsx peer dep (Next.js SSR crash workaround)",
        main: "index.js",
        license: "MIT",
      },
      null,
      2
    ),
    "index.js": '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\n',
  },
  "server-only": {
    "package.json": JSON.stringify(
      {
        name: "server-only",
        version: "0.0.1",
        description: "Shim for styled-jsx peer dep (Next.js SSR crash workaround)",
        main: "index.js",
        license: "MIT",
      },
      null,
      2
    ),
    "index.js": '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\n',
  },
  callsites: {
    "package.json": JSON.stringify(
      {
        name: "callsites",
        version: "3.1.0",
        description: "Shim callsites for ESLint (Next.js lint workaround)",
        main: "index.js",
        license: "MIT",
        engines: { node: ">=6" },
      },
      null,
      2
    ),
    "index.js": "'use strict';\nmodule.exports = function () { return []; };\n",
  },
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function ensureShim(name, files) {
  if (!fs.existsSync(NODE_MODULES)) return;

  const shimDir = path.join(NODE_MODULES, name);
  ensureDir(shimDir);

  for (const [fileName, content] of Object.entries(files)) {
    const filePath = path.join(shimDir, fileName);
    fs.writeFileSync(filePath, content, "utf8");
  }
  console.log(`[ensure-shims] OK: ${name} shim garantido em node_modules/${name}/`);
}

function main() {
  const shimNames = Object.keys(SHIMS);
  let count = 0;
  for (const name of shimNames) {
    try {
      ensureShim(name, SHIMS[name]);
      count++;
    } catch (err) {
      console.warn(`[ensure-shims] AVISO: não conseguiu criar shim ${name}: ${err.message}`);
    }
  }
  console.log(`[ensure-shims] Concluído: ${count}/${shimNames.length} shims verificados.`);
}

main();
