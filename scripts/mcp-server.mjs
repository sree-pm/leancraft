#!/usr/bin/env node
// Minimal MCP server for Leancraft — enforces ownership, exposes read_intent, propose_change, get_context
// Speak MCP JSON-RPC over stdio. Works with Claude Code, Cursor, Opencode.

import fs from "fs";
import path from "path";

const root = process.cwd();
const configPath = path.join(root, ".leancraft/config.json");

function readConfig() {
  try { return JSON.parse(fs.readFileSync(configPath, "utf8")); } catch { return { locked: false, denyAgentWrite: ["human/**"] }; }
}

const tools = [
  {
    name: "leancraft_read_intent",
    description: "MUST call first. Reads config + intent + guardrails + context. Returns the contract agent must obey.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "leancraft_get_context",
    description: "Returns compressed repo memory (agent/context.md, 500 lines). Use to avoid context rot.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "leancraft_propose_change",
    description: "When locked and you need to change human/**, write a proposal to agent/proposals/ instead. This is the ONLY way.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "human file you want to change, e.g., human/definition/intent.md" },
        reason: { type: "string" },
        diff: { type: "string", description: "unified diff" }
      },
      required: ["target", "reason", "diff"]
    }
  },
  {
    name: "leancraft_validate",
    description: "Runs the registry validator. Call before asking to Lock.",
    inputSchema: { type: "object", properties: {} }
  }
];

function handleTool(name, args) {
  const cfg = readConfig();
  if (name === "leancraft_read_intent") {
    const intent = fs.readFileSync(path.join(root, ".leancraft/human/definition/intent.md"), "utf8").slice(0, 4000);
    const guardrails = fs.readFileSync(path.join(root, ".leancraft/human/definition/guardrails.md"), "utf8").slice(0, 2000);
    const context = fs.readFileSync(path.join(root, ".leancraft/agent/context.md"), "utf8").slice(0, 2000);
    return { locked: cfg.locked, intent, guardrails, context, budget: cfg.budget, docRegistry: cfg.docRegistry };
  }
  if (name === "leancraft_get_context") {
    return fs.readFileSync(path.join(root, ".leancraft/agent/context.md"), "utf8");
  }
  if (name === "leancraft_propose_change") {
    if (!cfg.locked) return { error: "Not locked — you may edit human/** directly. No proposal needed." };
    // enforce human/** check
    if (!args.target.startsWith("human/")) return { error: "target must be human/**" };
    const id = Date.now().toString().slice(-6);
    const p = path.join(root, `.leancraft/agent/proposals/${id}-${args.target.replace(/\//g, "-")}.md`);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, `# Proposal: ${args.target}\n\n**Reason:** ${args.reason}\n\n**Diff:**\n\`\`\`diff\n${args.diff}\n\`\`\`\n\n> Human: merge this file to apply, or [❌ Don't].\n`);
    return { ok: true, proposal: p, message: "Proposal written. Ask human: [🔓 Unlock / ❌ Don't]" };
  }
  if (name === "leancraft_validate") {
    const { execSync } = awaitImport();
    try {
      const out = execSync("node scripts/leancraft-validate.mjs", { encoding: "utf8" });
      return { pass: true, output: out };
    } catch (e) {
      return { pass: false, output: e.stdout?.toString() || e.message };
    }
  }
  return { error: "unknown tool" };
}

function awaitImport() { return { execSync: (await import("child_process")).execSync }; }

// Minimal JSON-RPC loop
let buf = "";
process.stdin.on("data", chunk => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf("\n")) !== -1) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.method === "initialize") {
        respond(msg.id, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "leancraft", version: "1.0.0" } });
      } else if (msg.method === "tools/list") {
        respond(msg.id, { tools });
      } else if (msg.method === "tools/call") {
        const result = handleTool(msg.params.name, msg.params.arguments || {});
        // handle async validate
        if (result && typeof result.then === "function") {
          result.then(r => respond(msg.id, { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] }));
        } else {
          respond(msg.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
        }
      } else if (msg.method === "notifications/initialized") {
        // no-op
      } else {
        respond(msg.id, { error: { code: -32601, message: "Method not found: " + msg.method } });
      }
    } catch (e) {
      // ignore parse errors
    }
  }
});

function respond(id, result) {
  if (id == null) return;
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

// also support simple test mode
if (process.argv.includes("--test")) {
  console.log(JSON.stringify(handleTool("leancraft_read_intent", {}), null, 2));
}
