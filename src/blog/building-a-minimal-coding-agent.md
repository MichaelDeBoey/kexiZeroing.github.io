---
title: "Building a minimal coding agent"
description: ""
added: "Apr 6 2026"
tags: [AI]
---

> This post walks through the core components of a coding agent, based on [rasbt/mini-coding-agent](https://github.com/rasbt/mini-coding-agent). The original is in Python; the samples below are adapted to TypeScript.
> Another good one: https://www.mihaileric.com/The-Emperor-Has-No-Clothes

A coding agent is a specialized type of agent designed for software engineering tasks. It orchestrates code context, tools, execution, and iterative feedback within a focused workflow. Learn more in [Core building blocks of powerful agents](https://kexizeroing.github.io/post/core-building-blocks-of-powerful-agents).

Before diving into components, here's the end-to-end picture:

```
user types: "add input validation to the login function"
    │
    ▼
1. WorkspaceContext   — observe the repo (branch, status, docs)
    │
    ▼
2. Prompt assembly    — stack workspace + memory + history + message
    │
    ▼
3. Model call         — model responds with <tool> or <final>
    │
    ├── <tool>  ──▶  4. Validate + approve + run tool
    │                       │
    │                       ▼
    │                5. Clip output, update memory, save session
    │                       │
    │                       └──▶ loop back to step 2
    │
    └── <final> ──▶  print to user, done
```

Each loop iteration is one model call. The model drives the loop forward by choosing what to call next. When it has enough information, it emits `<final>` and the loop ends.

## Component 1: WorkspaceContext

The agent's first job is observing where it's running. Rather than letting the model guess about your project, you inject a live snapshot of the repository into every prompt.

```ts
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

const MAX_DOC_CHARS = 1_200;
const DOC_NAMES = ["AGENTS.md", "README.md", "package.json"];

function git(args: string[], cwd: string): string {
  try {
    return execSync(`git ${args.join(" ")}`, { cwd, encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

function buildWorkspace(cwd = ".") {
  const root = resolve(git(["rev-parse", "--show-toplevel"], cwd) || cwd);

  const docs: Record<string, string> = {};
  for (const name of DOC_NAMES) {
    const p = join(root, name);
    if (existsSync(p)) {
      docs[name] = readFileSync(p, "utf-8").slice(0, MAX_DOC_CHARS);
    }
  }

  return {
    root,
    branch: git(["branch", "--show-current"], root) || "unknown",
    status: git(["status", "--short"], root) || "clean",
    recentCommits: git(["log", "--oneline", "-5"], root)
      .split("\n")
      .filter(Boolean),
    docs,
  };
}

function workspaceText(ws: ReturnType<typeof buildWorkspace>): string {
  const commits =
    ws.recentCommits.map((c) => `  - ${c}`).join("\n") || "  - none";
  return `
Workspace:
  root:           ${ws.root}
  branch:         ${ws.branch}
  status:         ${ws.status}
  recent commits:
${commits}
  `.trim();
}
```

> `git rev-parse` is a low-level utility that Git uses internally to turn human-friendly Git inputs into precise, machine-usable values. One common usage is to print the SHA1 hashes given a revision specifier, `git rev-parse HEAD` helps you to find out the commit of the current HEAD.

`workspaceText()` returns a plain string that gets pasted into every prompt. The model now knows it's on a feature branch with two uncommitted files before you've asked it anything.

## Component 2: Prompt Assembly

The model never sees a structured "messages" array. It sees one flat string built from four layers stacked on top of each other:

1. **System prefix** — tool definitions and rules. Static per-session, never changes.
2. **Memory** — a compact summary of the current task, recently touched files, and recent tool results.
3. **History** — the conversation transcript, aggressively truncated for older entries.
4. **Current message** — what the user just asked.

```ts
const MAX_HISTORY_CHARS = 12_000;
const RECENT_HISTORY_WINDOW = 6;
const RECENT_ITEM_LIMIT = 900;
const OLD_ITEM_LIMIT = 180;

interface HistoryItem {
  role: "user" | "assistant" | "tool";
  name?: string;
  args?: Record<string, unknown>;
  content: string;
}

function historyText(history: HistoryItem[]): string {
  const lines: string[] = [];
  const recentStart = Math.max(0, history.length - RECENT_HISTORY_WINDOW);

  for (let i = 0; i < history.length; i++) {
    const item = history[i];
    const limit = i >= recentStart ? RECENT_ITEM_LIMIT : OLD_ITEM_LIMIT;

    if (item.role === "tool") {
      // `[tool:read_file] {"path":"src/auth.ts","start":1,"end":80}`
      lines.push(`[tool:${item.name}] ${JSON.stringify(item.args)}`);
      lines.push(item.content.slice(0, limit));
    } else {
      lines.push(`[${item.role}] ${item.content.slice(0, limit)}`);
    }
  }

  const full = lines.join("\n");
  return full.length > MAX_HISTORY_CHARS
    ? full.slice(0, MAX_HISTORY_CHARS) + "\n...[truncated]"
    : full;
}

function buildPrompt(opts: {
  systemPrefix: string;
  memory: string;
  history: HistoryItem[];
  userMessage: string;
}): string {
  return `
${opts.systemPrefix}

Memory:
${opts.memory}

Transcript:
${historyText(opts.history)}

Current user request:
${opts.userMessage}
`.trim();
}
```

## Component 3: Tools and Permissions

Tools are plain objects — a schema, a risk flag, and a function to run. The risk flag controls whether a human must approve the action before it executes.

```ts
type ApprovalPolicy = "ask" | "auto" | "never";

interface Tool {
  description: string;
  risky: boolean;
  run: (args: Record<string, unknown>) => string;
}

const tools: Record<string, Tool> = {
  read_file: {
    description: "Read lines from a file.",
    risky: false, // runs automatically
    run({ path, start = 1, end = 50 }) {
      const lines = readFileSync(String(path), "utf-8").split("\n");
      return lines
        .slice(Number(start) - 1, Number(end))
        .map((l, i) => `${Number(start) + i}: ${l}`)
        .join("\n");
    },
  },
  write_file: {
    description: "Write content to a file.",
    risky: true, // requires approval
    run({ path, content }) {
      writeFileSync(String(path), String(content), "utf-8");
      return `wrote ${path}`;
    },
  },
  patch_file: {
    description: "Replace one exact text block in a file.",
    risky: true,
    run({ path, old_text, new_text }) {
      const text = readFileSync(String(path), "utf-8");
      const count = text.split(String(old_text)).length - 1;
      if (count !== 1)
        throw new Error(`old_text must occur exactly once, found ${count}`);
      writeFileSync(
        String(path),
        text.replace(String(old_text), String(new_text)),
        "utf-8",
      );
      return `patched ${path}`;
    },
  },
  run_shell: {
    description: "Run a shell command.",
    risky: true,
    run({ command, timeout = 20 }) {
      const r = spawnSync(String(command), {
        shell: true,
        encoding: "utf-8",
        timeout: Number(timeout) * 1000,
      });
      return `exit ${r.status}\n${r.stdout}\n${r.stderr}`.trim();
    },
  },
};

function approve(name: string, args: unknown, policy: ApprovalPolicy): boolean {
  if (policy === "auto") return true;
  if (policy === "never") return false;
  const answer = readlineSync(
    `approve ${name} ${JSON.stringify(args)}? [y/N] `,
  );
  return answer.trim().toLowerCase() === "y";
}

function runTool(
  name: string,
  args: Record<string, unknown>,
  policy: ApprovalPolicy,
): string {
  const tool = tools[name];
  if (!tool) return `error: unknown tool '${name}'`;

  if (tool.risky && !approve(name, args, policy)) {
    return `error: approval denied for ${name}`;
  }

  try {
    return tool.run(args);
  } catch (err) {
    return `error: ${err instanceof Error ? err.message : err}`;
  }
}
```

`patch_file` lets the model express a targeted edit — replace this exact block — which is faster, less error-prone, and cheaper on tokens.

Three approval modes give you control over autonomy. `never` is useful for child agents (more on that in component 6). `auto` is useful in CI. `ask` is the safe default for interactive use.

## Component 4: Context Reduction

Two problems accumulate over a long session: tool outputs can be enormous, and history grows without bound. Both are handled before the content reaches the model.

```ts
const MAX_TOOL_OUTPUT = 4_000;

function clip(text: string, limit = MAX_TOOL_OUTPUT): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + `\n...[truncated ${text.length - limit} chars]`;
}

// Drop duplicate read_file entries for the same path in old history
function compressHistory(history: HistoryItem[]): HistoryItem[] {
  const seenReads = new Set<string>();
  const recentStart = Math.max(0, history.length - RECENT_HISTORY_WINDOW);

  return history.filter((item, i) => {
    // the item is outside the recent window
    const isOldRead =
      item.role === "tool" && item.name === "read_file" && i < recentStart;

    if (!isOldRead) return true;

    const path = String(item.args?.path ?? "");
    if (seenReads.has(path)) return false;
    seenReads.add(path);
    return true;
  });
}

// Block the model from calling the same tool with the same args twice in a row
function isRepeatedCall(
  history: HistoryItem[],
  name: string,
  args: Record<string, unknown>,
): boolean {
  const toolEvents = history.filter((h) => h.role === "tool");
  if (toolEvents.length < 2) return false;
  const last2 = toolEvents.slice(-2);
  return last2.every(
    (e) => e.name === name && JSON.stringify(e.args) === JSON.stringify(args),
  );
}
```

## Component 5: Sessions and Memory

State is managed at two levels with different purposes.

**Session** is the full raw log — every user message, tool call, and response — written to a JSON file after each turn. You can resume any past session by ID, which is useful when a task spans multiple terminal sessions or you need to audit what the agent did.

**Memory** is a compact editorial summary: the original task, the last several files touched, and the last few tool results as one-liners. This is what actually goes into the prompt — small enough to not crowd out other context, but informative enough to keep the model oriented.

```ts
const MAX_MEMORY_FILES = 8;
const MAX_MEMORY_NOTES = 5;
const MAX_NOTE_CHARS = 220;
const MAX_TASK_CHARS = 300;

interface Memory {
  task: string; // set once from the first user message
  files: string[]; // rolling window of recently touched files
  notes: string[]; // rolling window of summarised tool results
}

interface Session {
  id: string;
  history: HistoryItem[];
  memory: Memory;
}

// Keep a rolling window: drop the oldest if over the limit
function rememberItem(bucket: string[], item: string, limit: number): void {
  const idx = bucket.indexOf(item);
  if (idx !== -1) bucket.splice(idx, 1); // bump to end if already present
  bucket.push(item);
  if (bucket.length > limit) bucket.shift();
}

// Called after every tool run — keeps memory current
function updateMemory(
  memory: Memory,
  toolName: string,
  args: Record<string, unknown>,
  result: string,
): void {
  if (
    ["read_file", "write_file", "patch_file"].includes(toolName) &&
    args.path
  ) {
    rememberItem(memory.files, String(args.path), MAX_MEMORY_FILES);
  }
  const note = `${toolName}: ${result.replace(/\n/g, " ").slice(0, MAX_NOTE_CHARS)}`;
  rememberItem(memory.notes, note, MAX_MEMORY_NOTES);
}

// Rendered into the prompt on every call
function memoryText(memory: Memory): string {
  return `
task:  ${memory.task || "-"}
files: ${memory.files.join(", ") || "-"}
notes:
  ${memory.notes.map((n) => `- ${n}`).join("\n  ") || "- none"}
`.trim();
}

// Persistence
function saveSession(session: Session, dir: string): string {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${session.id}.json`);
  writeFileSync(path, JSON.stringify(session, null, 2), "utf-8");
  return path;
}

function loadSession(id: string, dir: string): Session {
  return JSON.parse(readFileSync(join(dir, `${id}.json`), "utf-8"));
}
```

The key design point: session and memory serve different readers. The session file is for humans and future agent instances resuming work. Memory is for the model on the current turn. They're maintained in sync but serve distinct purposes.

## Component 6: Delegation

The parent agent can spawn a child agent to investigate without spending its own step budget on pure reading. The child runs with `readOnly: true` and `approvalPolicy: "never"` — it can list files and read, but it cannot write, patch, or execute commands.

```ts
function runChildAgent(
  task: string,
  maxSteps: number,
  parent: MiniAgent,
): string {
  const child = new MiniAgent({
    approvalPolicy: "never", // child never touches the filesystem
    readOnly: true,
    maxSteps, // small step budget — investigate only
    depth: parent.depth + 1,
    maxDepth: parent.maxDepth, // hard ceiling prevents runaway recursion
  });

  // Give the child a compressed snapshot of what the parent already knows
  child.memory.notes = [clip(parent.historyText(), MAX_NOTE_CHARS)];
  child.memory.task = task;

  const result = child.ask(task);
  return `delegate_result:\n${result}`;
  // The parent reads this string as a regular tool result
}
```

Depth is capped at 1 by default, so you get parent -> child but never grandchildren. The parent passes a compressed slice of its history to the child, so the child has enough context to do useful work without receiving the full uncompressed log.

## Putting it all together: the agent loop

Here is the complete loop. Every component you've read about shows up in order.

```ts
async function ask(
  userMessage: string,
  session: Session,
  workspace: ReturnType<typeof buildWorkspace>,
  policy: ApprovalPolicy,
): Promise<string> {
  // Component 5: set task on first message
  if (!session.memory.task) {
    session.memory.task = userMessage.slice(0, MAX_TASK_CHARS);
  }
  session.history.push({ role: "user", content: userMessage });

  const MAX_STEPS = 6;

  for (let step = 0; step < MAX_STEPS; step++) {
    // Component 2: assemble prompt from all four layers
    const prompt = buildPrompt({
      systemPrefix: buildSystemPrefix(tools), // static tool defs + rules
      memory: memoryText(session.memory),
      history: compressHistory(session.history),
      userMessage,
    });

    const raw = await model.complete(prompt);

    // Parse the model's raw text into a structured action
    const { kind, payload } = parse(raw);

    if (kind === "tool") {
      const { name, args } = payload;

      // Component 4: block identical repeated calls
      if (isRepeatedCall(session.history, name, args)) {
        session.history.push({
          role: "tool",
          name,
          args,
          content: "error: repeated call — try a different approach",
        });
        continue;
      }

      // Component 3: validate + approve + run
      const result = runTool(name, args, policy);

      // Component 4: cap output before storing
      const clipped = clip(result);

      // Component 5: update memory and persist
      session.history.push({ role: "tool", name, args, content: clipped });
      updateMemory(session.memory, name, args, clipped);
      saveSession(session, SESSION_DIR);

      continue; // loop — model decides what to do next
    }

    if (kind === "final") {
      session.history.push({ role: "assistant", content: payload });
      saveSession(session, SESSION_DIR);
      return payload; // done
    }

    // kind === "retry": model returned something unparseable
    // append a notice and let it try again (counts against MAX_STEPS)
    session.history.push({ role: "assistant", content: payload });
  }

  return "Stopped: step limit reached without a final answer.";
}
```
