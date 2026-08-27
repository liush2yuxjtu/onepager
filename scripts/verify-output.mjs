#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const htmlArg = args[0];
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

if (!htmlArg || htmlArg.startsWith("-")) {
  console.error("usage: node verify-output.mjs <dist/index.html> [--spec <spec.json>]");
  process.exit(2);
}

const htmlPath = resolve(htmlArg);
const specPath = option("--spec") ? resolve(option("--spec")) : undefined;
const errors = [];
const checks = [];

const html = await readFile(htmlPath, "utf8");
checks.push({ name: "html_exists", passed: html.length > 0, bytes: Buffer.byteLength(html) });

const attr = (tag, name) => {
  const match = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i").exec(tag);
  return match?.[2]?.trim();
};
const isInline = (value) => !value || value.startsWith("data:") || value.startsWith("#") || value.startsWith("blob:");

for (const match of html.matchAll(/<(script|link|img|source|video|audio|iframe|object)\b[^>]*>/gi)) {
  const [tag, rawName] = match;
  const name = rawName.toLowerCase();
  const resource = name === "link" ? attr(tag, "href") : name === "object" ? attr(tag, "data") : attr(tag, "src") || attr(tag, "poster");
  if (resource && !isInline(resource)) errors.push(`external resource: ${name} -> ${resource}`);
}
for (const styleMatch of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
  const css = styleMatch[1];
  if (/@import\b/i.test(css)) errors.push("external-capable CSS @import found");
  for (const match of css.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
    const value = match[2].trim();
    if (!isInline(value)) errors.push(`external CSS url(): ${value}`);
  }
}
checks.push({ name: "no_external_resources", passed: errors.length === 0 });

const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else files.push(path);
  }
}
await walk(dirname(htmlPath));
const distOnlyHtml = files.length === 1 && files[0] === htmlPath;
if (!distOnlyHtml) errors.push(`dist is not single-file: ${files.join(", ")}`);
checks.push({ name: "single_file_dist", passed: distOnlyHtml, files: files.length });

let specSummary;
if (specPath) {
  const raw = await readFile(specPath, "utf8");
  const specErrors = [];
  const componentTypes = new Set();
  let spec = {};
  try {
    spec = JSON.parse(raw);
  } catch (error) {
    specErrors.push(`invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  const bannedKeys = new Set([
    "classname", "style", "html", "javascript", "reactsource", "svgpath",
    "dangerouslysetinnerhtml", "runscript", "executescript"
  ]);
  const bannedTypes = new Set([
    "div", "span", "rect", "path", "bluebox", "bigtext", "customhtml",
    "customcss", "script", "fullbusinessdashboard"
  ]);

  function inspect(value, pointer = "") {
    if (Array.isArray(value)) return value.forEach((item, index) => inspect(item, `${pointer}/${index}`));
    if (!value || typeof value !== "object") {
      if (typeof value === "string" && /<script\b|javascript:|dangerouslySetInnerHTML|\b(?:run|execute)Script\b|=>|\bfunction\s*\(/i.test(value)) {
        specErrors.push(`${pointer || "/"}: code-like string`);
      }
      return;
    }
    for (const [key, child] of Object.entries(value)) {
      if (bannedKeys.has(key.toLowerCase())) specErrors.push(`${pointer}/${key}: forbidden key`);
      if (key === "type" && typeof child === "string") {
        componentTypes.add(child);
        if (bannedTypes.has(child.toLowerCase())) specErrors.push(`${pointer}/type: forbidden component ${child}`);
      }
      inspect(child, `${pointer}/${key}`);
    }
  }
  inspect(spec);

  if (spec.root !== undefined || spec.elements !== undefined) {
    if (typeof spec.root !== "string" || !spec.elements || typeof spec.elements !== "object") {
      specErrors.push("flat spec requires string root and elements object");
    } else {
      if (!spec.elements[spec.root]) specErrors.push(`missing root element: ${spec.root}`);
      for (const [key, element] of Object.entries(spec.elements)) {
        for (const child of element.children ?? []) if (!spec.elements[child]) specErrors.push(`${key}: missing child ${child}`);
        for (const [slot, children] of Object.entries(element.slots ?? {})) {
          if (slot === "default") specErrors.push(`${key}: use children instead of slots.default`);
          for (const child of children) if (!spec.elements[child]) specErrors.push(`${key}: missing slot child ${child}`);
        }
      }
    }
  }

  errors.push(...specErrors.map((message) => `unsafe spec: ${message}`));
  specSummary = { componentTypes: [...componentTypes].sort(), errors: specErrors.length };
  checks.push({ name: "spec_is_data_only", passed: specErrors.length === 0, ...specSummary });
}

const result = {
  ok: errors.length === 0,
  html: htmlPath,
  spec: specPath,
  checks,
  errors,
};
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
