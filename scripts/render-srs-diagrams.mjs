import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const root = process.cwd();
const docsPath = path.join(root, "docs/srs-testing/05-diagrams.md");
const outputDir = path.join(root, "docs/srs-testing/diagrams");
const byFunctionDir = path.join(outputDir, "by-function");

const diagramNames = [
  {
    file: "use-case-diagram",
    type: "plantuml",
    title: "Use Case Diagram"
  },
  {
    file: "activity-login",
    type: "mermaid",
    title: "Activity Diagram - Dang nhap"
  },
  {
    file: "activity-submit-assignment",
    type: "mermaid",
    title: "Activity Diagram - Student nop bai"
  },
  {
    file: "activity-generate-roadmap-ai",
    type: "mermaid",
    title: "Activity Diagram - Tao roadmap bang AI"
  },
  {
    file: "sequence-grade-submission",
    type: "mermaid",
    title: "Sequence Diagram - Cham diem bai nop"
  }
];

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const markdown = await fs.readFile(docsPath, "utf8");
  const fences = extractCodeFences(markdown);

  if (fences.length < diagramNames.length) {
    throw new Error(`Expected ${diagramNames.length} diagrams, found ${fences.length}.`);
  }

  const rendered = [];
  for (let index = 0; index < diagramNames.length; index += 1) {
    const meta = diagramNames[index];
    const fence = fences[index];
    if (fence.lang !== meta.type) {
      throw new Error(`Diagram ${meta.file} expected ${meta.type}, found ${fence.lang}.`);
    }

    const sourceExtension = meta.type === "plantuml" ? "puml" : "mmd";
    const sourcePath = path.join(outputDir, `${meta.file}.${sourceExtension}`);
    const svgPath = path.join(outputDir, `${meta.file}.svg`);
    const pngPath = path.join(outputDir, `${meta.file}.png`);
    const xmlPath = path.join(outputDir, `${meta.file}.xml`);

    await fs.writeFile(sourcePath, fence.code.trim() + "\n", "utf8");
    try {
      if (meta.type === "plantuml") {
        const svg = await renderPlantUml(fence.code, "svg");
        const png = await renderPlantUml(fence.code, "png");
        await fs.writeFile(svgPath, svg, "utf8");
        await fs.writeFile(pngPath, png);
        await fs.writeFile(xmlPath, svg, "utf8");
      } else {
        await renderMermaidLocal(sourcePath, svgPath, pngPath);
        const svg = await fs.readFile(svgPath, "utf8");
        await fs.writeFile(xmlPath, svg, "utf8");
      }
    } catch (error) {
      throw new Error(`${meta.file}.${sourceExtension}: ${error.message}`);
    }

    rendered.push({
      title: meta.title,
      source: slash(path.relative(root, sourcePath)),
      image: slash(path.relative(root, svgPath)),
      png: slash(path.relative(root, pngPath)),
      xml: slash(path.relative(root, xmlPath))
    });
  }

  await fs.writeFile(path.join(outputDir, "index.md"), buildIndex(rendered), "utf8");
  const byFunctionRendered = await renderDiagramDirectory(byFunctionDir);
  console.log(`Rendered ${rendered.length + byFunctionRendered.length} diagrams to ${slash(path.relative(root, outputDir))}`);
  for (const item of rendered) {
    console.log(`- ${item.image}`);
  }
  for (const item of byFunctionRendered) {
    console.log(`- ${item.image}`);
  }
}

function extractCodeFences(markdown) {
  const fences = [];
  const pattern = /```(plantuml|mermaid)\r?\n([\s\S]*?)```/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    fences.push({
      lang: match[1],
      code: match[2]
    });
  }
  return fences;
}

async function renderPlantUml(source, format) {
  const encoded = encodePlantUml(source);
  const response = await fetch(`https://www.plantuml.com/plantuml/${format}/${encoded}`);
  if (!response.ok) {
    throw new Error(`PlantUML render failed with HTTP ${response.status}.`);
  }
  if (format === "png") {
    const body = Buffer.from(await response.arrayBuffer());
    if (body.length < 200) throw new Error("PlantUML PNG render returned an unexpectedly small file.");
    return body;
  }
  const body = await response.text();
  if (body.length < 200 || !body.includes("<svg")) {
    throw new Error("PlantUML SVG render returned invalid SVG.");
  }
  return body;
}

async function renderMermaidLocal(sourcePath, svgPath, pngPath) {
  await runMmdc(sourcePath, svgPath);
  await runMmdc(sourcePath, pngPath);

  const svg = await fs.readFile(svgPath, "utf8");
  const png = await fs.readFile(pngPath);
  if (svg.length < 200 || !svg.includes("<svg")) {
    throw new Error("Mermaid CLI returned invalid SVG.");
  }
  if (png.length < 200) {
    throw new Error("Mermaid CLI returned an unexpectedly small PNG.");
  }
}

async function runMmdc(sourcePath, outputPath) {
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  await execFileAsync(npx, [
    "-y",
    "@mermaid-js/mermaid-cli",
    "-i",
    sourcePath,
    "-o",
    outputPath
  ], {
    cwd: root,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 10
  });
}

function encodePlantUml(source) {
  const compressed = zlib.deflateRawSync(Buffer.from(source, "utf8"), { level: 9 });
  return encode64(compressed);
}

function encode64(buffer) {
  let result = "";
  for (let index = 0; index < buffer.length; index += 3) {
    const b1 = buffer[index];
    const b2 = index + 1 < buffer.length ? buffer[index + 1] : 0;
    const b3 = index + 2 < buffer.length ? buffer[index + 2] : 0;
    result += append3bytes(b1, b2, b3);
  }
  return result;
}

function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;
  return encode6bit(c1) + encode6bit(c2) + encode6bit(c3) + encode6bit(c4);
}

function encode6bit(value) {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
  return alphabet[value & 0x3f];
}

function buildIndex(rendered) {
  return [
    "# Rendered SRS Diagrams",
    "",
    "Generated from `docs/srs-testing/05-diagrams.md`.",
    "",
    ...rendered.flatMap((item) => [
      `## ${item.title}`,
      "",
      `Source: [${path.basename(item.source)}](${item.source})`,
      "",
      `SVG: [${path.basename(item.image)}](${item.image}) | PNG: [${path.basename(item.png)}](${item.png}) | XML: [${path.basename(item.xml)}](${item.xml})`,
      "",
      `![${item.title}](${item.image})`,
      ""
    ])
  ].join("\n");
}

async function renderDiagramDirectory(directory) {
  const exists = await safeStat(directory);
  if (!exists?.isDirectory()) return [];

  const entries = await fs.readdir(directory, { withFileTypes: true });
  const rendered = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const extension = path.extname(entry.name).toLowerCase();
    if (extension !== ".puml" && extension !== ".mmd") continue;

    const sourcePath = path.join(directory, entry.name);
    const baseName = path.basename(entry.name, extension);
    const source = await fs.readFile(sourcePath, "utf8");
    const type = extension === ".puml" ? "plantuml" : "mermaid";
    const svgPath = path.join(directory, `${baseName}.svg`);
    const pngPath = path.join(directory, `${baseName}.png`);
    const xmlPath = path.join(directory, `${baseName}.xml`);

    try {
      if (type === "plantuml") {
        const svg = await renderPlantUml(source, "svg");
        const png = await renderPlantUml(source, "png");
        await fs.writeFile(svgPath, svg, "utf8");
        await fs.writeFile(pngPath, png);
        await fs.writeFile(xmlPath, svg, "utf8");
      } else {
        await renderMermaidLocal(sourcePath, svgPath, pngPath);
        const svg = await fs.readFile(svgPath, "utf8");
        await fs.writeFile(xmlPath, svg, "utf8");
      }
    } catch (error) {
      throw new Error(`${entry.name}: ${error.message}`);
    }
    rendered.push({
      source: slash(path.relative(root, sourcePath)),
      image: slash(path.relative(root, svgPath)),
      png: slash(path.relative(root, pngPath)),
      xml: slash(path.relative(root, xmlPath))
    });
  }

  if (rendered.length > 0) {
    await fs.writeFile(path.join(directory, "index.md"), buildDirectoryIndex(rendered), "utf8");
  }

  return rendered;
}

function buildDirectoryIndex(rendered) {
  return [
    "# Diagrams By Function",
    "",
    "| Source | SVG | PNG | XML |",
    "|---|---|---|---|",
    ...rendered.map((item) => `| [${path.basename(item.source)}](${path.basename(item.source)}) | [SVG](${path.basename(item.image)}) | [PNG](${path.basename(item.png)}) | [XML](${path.basename(item.xml)}) |`)
  ].join("\n") + "\n";
}

async function safeStat(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function slash(value) {
  return value.split(path.sep).join("/");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
