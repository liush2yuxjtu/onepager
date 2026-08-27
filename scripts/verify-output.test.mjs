import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const verifier = join(dirname(fileURLToPath(import.meta.url)), "verify-output.mjs");

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "onepager-verify-"));
  const dist = join(root, "dist");
  await mkdir(dist);
  await writeFile(join(dist, "index.html"), "<!doctype html><title>fixture</title>");
  return root;
}

function verify(root, ...args) {
  const result = spawnSync(process.execPath, [verifier, join(root, "dist/index.html"), ...args], {
    encoding: "utf8",
  });
  try {
    return { status: result.status, report: JSON.parse(result.stdout) };
  } catch (error) {
    throw new Error(`Verifier returned invalid JSON: ${result.stderr}`, { cause: error });
  }
}

test("strict modes require an explicit spec", async (context) => {
  const root = await fixture();
  context.after(() => rm(root, { recursive: true, force: true }));
  const { status, report } = verify(root, "--require-react-features");
  assert.equal(status, 1);
  assert.ok(report.errors.includes("strict verification requires --spec <spec.json>"));
});

test("state metadata cannot impersonate React element features", async (context) => {
  const root = await fixture();
  context.after(() => rm(root, { recursive: true, force: true }));
  const spec = {
    root: "root",
    state: { repeat: {}, visible: true, on: {}, watch: {}, binding: { $bindState: "/x" } },
    elements: { root: { type: "Box", props: {}, children: [] } },
  };
  await writeFile(join(root, "spec.json"), JSON.stringify(spec));
  const { status, report } = verify(root, "--spec", join(root, "spec.json"), "--require-react-features");
  assert.equal(status, 1);
  for (const feature of ["repeat", "visible", "on", "watch", "binding"])
    assert.ok(report.errors.includes(`unsafe spec: data-driven React spec requires ${feature}`));
});

test("comments and strings do not prove executable React capabilities", async (context) => {
  const root = await fixture();
  context.after(() => rm(root, { recursive: true, force: true }));
  const spec = {
    root: "root",
    state: { items: [] },
    elements: {
      root: {
        type: "Box",
        props: { value: { $bindState: "/value" } },
        repeat: { statePath: "/items" },
        visible: true,
        on: { press: { action: "noop" } },
        watch: { "/value": { action: "noop" } },
        children: [],
      },
    },
  };
  await writeFile(join(root, "spec.json"), JSON.stringify(spec));
  await writeFile(
    join(root, "source.tsx"),
    '// defineCatalog(); defineRegistry(); validateSpec(); useBoundProp(); <Renderer /> <JSONUIProvider handlers={x} />\nconst bait = "all capabilities in a string";',
  );
  const { status, report } = verify(
    root,
    "--spec",
    join(root, "spec.json"),
    "--source",
    join(root, "source.tsx"),
    "--require-react-features",
  );
  assert.equal(status, 1);
  assert.ok(report.errors.some((error) => error.includes("defineCatalog import")));
  assert.ok(report.errors.some((error) => error.includes("executable Renderer")));
});

test("clipboard fallback is required regardless of action name", async (context) => {
  const root = await fixture();
  context.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, "source.ts"), 'async function copySelected(text) { await navigator.clipboard.writeText(text); }');
  const { status, report } = verify(root, "--source", join(root, "source.ts"));
  assert.equal(status, 1);
  assert.ok(report.errors.includes("Clipboard API usage requires a local textarea/execCommand fallback"));
});

test("typed custom graph registries are accepted", async (context) => {
  const root = await fixture();
  context.after(() => rm(root, { recursive: true, force: true }));
  const spec = {
    nodes: [{ id: "a", kind: "service", x: 0, y: 0 }],
    edges: [],
  };
  await writeFile(join(root, "spec.json"), JSON.stringify(spec));
  await writeFile(
    join(root, "source.ts"),
    'import { defineSchema } from "@json-render/core"; const schema = defineSchema((s) => ({ spec: s.object({}), catalog: s.object({}) })); const catalog = schema.createCatalog({}); const nodeRegistry: Record<string, unknown> = {};',
  );
  const { report } = verify(
    root,
    "--spec",
    join(root, "spec.json"),
    "--source",
    join(root, "source.ts"),
    "--require-custom-graph",
  );
  assert.ok(!report.errors.some((error) => error.includes("trusted registry")));
});
