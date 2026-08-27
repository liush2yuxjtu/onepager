#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const htmlArg = args[0];
const options = (name) =>
  args.flatMap((value, index) => value === name && args[index + 1] ? [args[index + 1]] : []);
const option = (name) => options(name)[0];

if (!htmlArg || htmlArg.startsWith("-")) {
  process.stderr.write("usage: node verify-output.mjs <dist/index.html> [--spec <spec.json>] [--source <file>] [--require-react-features|--require-custom-graph]\n");
  process.exit(2);
}

const htmlPath = resolve(htmlArg);
const specPath = option("--spec") ? resolve(option("--spec")) : undefined;
const sourcePaths = options("--source").map((path) => resolve(path));
const requireReactFeatures = args.includes("--require-react-features");
const requireCustomGraph = args.includes("--require-custom-graph");
const errors = [];
const checks = [];

const html = await readFile(htmlPath, "utf8");
checks.push({ name: "html_exists", passed: html.length > 0, bytes: Buffer.byteLength(html) });

const attr = (tag, name) => {
  const match = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i").exec(tag);
  return match?.[2]?.trim();
};
const isInline = (value) =>
  !value || value.startsWith("data:") || value.startsWith("#") || value.startsWith("blob:");

for (const match of html.matchAll(/<(script|link|img|source|video|audio|iframe|object)\b[^>]*>/gi)) {
  const [tag, rawName] = match;
  const name = rawName.toLowerCase();
  let resource;
  if (name === "link") resource = attr(tag, "href");
  else if (name === "object") resource = attr(tag, "data");
  else resource = attr(tag, "src") || attr(tag, "poster");
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
let specText = "";
if (specPath) {
  const raw = await readFile(specPath, "utf8");
  specText = raw;
  const specErrors = [];
  const componentTypes = new Set();
  const featureCounts = { repeat: 0, visible: 0, on: 0, watch: 0, binding: 0 };
  let spec = {};
  try {
    spec = JSON.parse(raw);
  } catch (error) {
    specErrors.push(`invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  const bannedKeys = new Set([
    "classname", "style", "html", "javascript", "reactsource", "svgpath",
    "dangerouslysetinnerhtml", "runscript", "executescript",
  ]);
  const bannedTypes = new Set([
    "div", "span", "rect", "path", "bluebox", "bigtext", "customhtml",
    "customcss", "script", "fullbusinessdashboard",
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
      if (key === "repeat" || key === "visible" || key === "on" || key === "watch") featureCounts[key] += 1;
      if (key === "$bindState" || key === "$bindItem") featureCounts.binding += 1;
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
        if (["EvidenceList", "ActionList", "FindingList"].includes(element.type) && Array.isArray(element.props?.items)) {
          specErrors.push(`${key}: move business items to spec.state and render them with repeat`);
        }
        for (const child of element.children ?? []) if (!spec.elements[child]) specErrors.push(`${key}: missing child ${child}`);
        for (const [slot, children] of Object.entries(element.slots ?? {})) {
          if (slot === "default") specErrors.push(`${key}: use children instead of slots.default`);
          for (const child of children) if (!spec.elements[child]) specErrors.push(`${key}: missing slot child ${child}`);
        }
      }
    }
  }

  if (requireReactFeatures) {
    if (!spec.state || typeof spec.state !== "object") specErrors.push("data-driven React spec requires top-level state");
    for (const key of ["repeat", "visible", "on", "watch", "binding"]) {
      if (featureCounts[key] === 0) specErrors.push(`data-driven React spec requires ${key}`);
    }
  }

  if (requireCustomGraph) {
    if (!Array.isArray(spec.nodes) || !Array.isArray(spec.edges)) {
      specErrors.push("custom graph spec requires nodes[] and edges[]");
    } else {
      const ids = new Set();
      for (const [index, node] of spec.nodes.entries()) {
        for (const key of ["id", "kind", "x", "y"]) if (node?.[key] === undefined) specErrors.push(`nodes/${index}: missing ${key}`);
        if (node?.id) ids.add(node.id);
      }
      for (const [index, edge] of spec.edges.entries()) {
        for (const key of ["source", "target", "relation"]) if (edge?.[key] === undefined) specErrors.push(`edges/${index}: missing ${key}`);
        if (edge?.source && !ids.has(edge.source)) specErrors.push(`edges/${index}: missing source node ${edge.source}`);
        if (edge?.target && !ids.has(edge.target)) specErrors.push(`edges/${index}: missing target node ${edge.target}`);
      }
    }
  }

  errors.push(...specErrors.map((message) => `unsafe spec: ${message}`));
  specSummary = {
    componentTypes: [...componentTypes].sort(),
    features: featureCounts,
    errors: specErrors.length,
  };
  checks.push({ name: "spec_is_data_only", passed: specErrors.length === 0, ...specSummary });
}

if (sourcePaths.length || requireReactFeatures || requireCustomGraph) {
  const sourceErrors = [];
  let source = "";
  for (const path of sourcePaths) source += `\n${await readFile(path, "utf8")}`;
  if (/<div\b(?=[^>]*\baria-label\s*=)(?![^>]*\brole\s*=)[^>]*>/s.test(source)) {
    sourceErrors.push("div with aria-label requires a valid role or a semantic element");
  }
  if (/<aside\b(?![^>]*\b(?:aria-label|aria-labelledby|title)\s*=)[^>]*>/s.test(source)) {
    sourceErrors.push("aside landmark requires a unique accessible name; generic Callout should use div");
  }
  if (/\bcopyActions\b/.test(source) && /navigator\.clipboard\.writeText/.test(source) && !/execCommand\s*\(\s*["']copy["']/.test(source)) {
    sourceErrors.push("copyActions requires a textarea/execCommand('copy') fallback when Clipboard API is unavailable or denied");
  }
  if (requireCustomGraph && /<svg\b[^>]*\brole\s*=\s*["']img["']/s.test(source) && /(?:\btabIndex\s*=|\brole\s*=\s*["']button["'])/s.test(source)) {
    sourceErrors.push("interactive SVG cannot use role=img around focusable/button descendants");
  }
  if (requireReactFeatures) {
    const required = {
      defineCatalog: /\bdefineCatalog\s*\(/,
      defineRegistry: /\bdefineRegistry\s*\(/,
      Renderer: /<Renderer\b|\bRenderer\s*\(/,
      useBoundProp: /\buseBoundProp\s*\(/,
      catalogValidate: /\bcatalog\.validate\s*\(/,
      validateSpec: /\bvalidateSpec\s*\(/,
      actionProvider: /\b(?:ActionProvider|JSONUIProvider)\b/,
      visibilityProvider: /\b(?:VisibilityProvider|JSONUIProvider)\b/,
      validationProvider: /\b(?:ValidationProvider|JSONUIProvider)\b/,
      handlersProp: /<(?:JSONUIProvider|ActionProvider)\b[^>]*\bhandlers\s*=/s,
    };
    for (const [name, pattern] of Object.entries(required)) if (!pattern.test(source)) sourceErrors.push(`source requires ${name}`);
    const editProtocol = `${source}\n${specText}`;
    if (!/JSON Patch/i.test(editProtocol) || !/Merge Patch/i.test(editProtocol)) {
      sourceErrors.push("editing contract must distinguish single-field JSON Patch from structural Merge Patch");
    }
    if (/\bvalidateSpec\s*\(\s*\w+\.data\b/.test(source)) {
      sourceErrors.push("validateSpec must receive the validated raw spec, not catalog.validate(...).data");
    }
    if (/\b(?:const|let|var)\s+spec(?:\s*:[^=]+)?\s*=\s*(?:\w+\.data\b|\{[\s\S]{0,240}?\.\.\.\s*\(?\s*\w+\.data\b)/.test(source)) {
      sourceErrors.push("Renderer spec must preserve raw state/on/watch; do not derive it from catalog.validate(...).data");
    }
    if (/\bhandlers\s*\(\s*\(\s*\)\s*=>\s*(?:undefined|null)\b/.test(source)) {
      sourceErrors.push("custom actions are disabled: handler factory received no SetState; wire real host handlers or a real SetState adapter");
    }
    const emptyActions = [...source.matchAll(/\b([A-Za-z_$][\w$]*)\s*:\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{\s*\}/g)].map((match) => match[1]);
    if (emptyActions.length) {
      sourceErrors.push(`custom actions must have observable effects; empty handlers: ${[...new Set(emptyActions)].join(", ")}`);
    }
  }
  if (requireCustomGraph) {
    if (!/\bdefineSchema\s*\(/.test(source)) sourceErrors.push("custom graph source requires defineSchema");
    if (!/\b(?:defineCatalog\s*\(|\.createCatalog\s*\()/.test(source)) sourceErrors.push("custom graph source requires catalog");
    if (!/\b(?:const|let|var)\s+\w*registry\w*\s*=/i.test(source)) sourceErrors.push("custom graph source requires an explicit trusted registry");
  }
  errors.push(...sourceErrors);
  checks.push({ name: "required_source_capabilities", passed: sourceErrors.length === 0, sources: sourcePaths, errors: sourceErrors });
}

const result = { ok: errors.length === 0, html: htmlPath, spec: specPath, checks, errors };
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exitCode = result.ok ? 0 : 1;
