// utils/interactiveInput.ts

export type InputItem = {
  id: string;
  lang: "c" | "cpp" | "java" | "python" | "javascript";
  rawCall: string;
  spec: string;
  vars: string[];
  fields: Array<{
    fmt: string;
    type: "int" | "float" | "double" | "char" | "string" | "boolean" | "unknown";
  }>;
  prompt?: string;
  separator: "space" | "newline";
};

// ============= C Parser =============
const C_SCANF_RE = /scanf\s*\(\s*("(?:(?:[^"\\]|\\.)*)")\s*(?:,\s*([^)]+))?\s*\)\s*;/g;
const C_PRINTF_RE = /printf\s*\(\s*("(?:(?:[^"\\]|\\.)*)")/g;
const C_FMT_RE = /%(%|(?:\*?)(\d+)?l?l?[cdfiosuxXpn]|lf|f|d|i|c|s)/g;

const unescapeC = (lit: string) => {
  let s = lit.replace(/^"/, "").replace(/"$/, "");
  s = s
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r")
    .replace(/\\0/g, "\0")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
  return s;
};

const mapCType = (fmt: string): InputItem["fields"][number]["type"] => {
  if (/%\*?\d*l?l?[di]/.test(fmt)) return "int";
  if (/%\*?\d*lf/.test(fmt)) return "double";
  if (/%\*?\d*f/.test(fmt)) return "float";
  if (/%\*?\d*c/.test(fmt)) return "char";
  if (/%\*?\d*s/.test(fmt)) return "string";
  return "unknown";
};

export function parseCInteractiveInputs(source: string): InputItem[] {
  const items: InputItem[] = [];
  const printfMatches: Array<{ index: number; spec: string }> = [];

  let pm: RegExpExecArray | null;
  C_PRINTF_RE.lastIndex = 0;
  while ((pm = C_PRINTF_RE.exec(source))) {
    if (pm.index == null || !pm[1]) continue;
    printfMatches.push({ index: pm.index, spec: unescapeC(pm[1]) });
  }

  let m: RegExpExecArray | null;
  C_SCANF_RE.lastIndex = 0;
  while ((m = C_SCANF_RE.exec(source))) {
    const idx = m.index || 0;
    const fmtLit = m[1];
    const arglist = (m[2] || "").trim();
    const spec = unescapeC(fmtLit);

    const fields: InputItem["fields"] = [];
    let mm: RegExpExecArray | null;
    C_FMT_RE.lastIndex = 0;
    while ((mm = C_FMT_RE.exec(spec))) {
      const token = mm[0];
      if (token === "%%") continue;
      if (/^%\*/.test(token)) continue;
      fields.push({ fmt: token, type: mapCType(token) });
    }
    if (!fields.length) continue;

    const vars = arglist
      ? arglist.split(",").map(s => s.trim().replace(/^&/, "")).filter(Boolean)
      : [];

    let prompt: string | undefined;
    const near = printfMatches.filter(p => p.index < idx).pop();
    if (near && idx - near.index < 200) prompt = near.spec;

    items.push({
      id: "scanf-" + idx,
      lang: "c",
      rawCall: m[0],
      spec,
      vars,
      fields,
      prompt,
      separator: /\n/.test(spec) ? "newline" : "space"
    });
  }

  return items;
}

// ============= C++ Parser =============
// ============= C++ Parser (sturdier) =============

// Grab full cout chains up to the semicolon. Works with std::cout or cout, across newlines.
const CPP_COUT_CHAIN_RE =
  /(?:^|[^\w:])(std::)?cout\s*<<\s*([\s\S]*?)\s*;/g;

// Grab full cin extraction chains up to the semicolon. Works with std::cin or cin, across newlines.
const CPP_CIN_CHAIN_RE =
  /(?:^|[^\w:])(std::)?cin\s*>>\s*([\s\S]*?)\s*;/g;

// std::getline(std::cin, var) or getline(cin, var)
const CPP_GETLINE_RE =
  /(?:^|[^\w:])(?:std::)?getline\s*\(\s*(?:std::)?cin\s*,\s*([A-Za-z_]\w*)\s*(?:,[^)]*)?\)\s*;/g;

// Simple decl scanner before the input site (best-effort; good enough for lab code)
const CPP_DECL_RE =
  /\b(?:bool|char|int|long\s+long|long|float|double|(?:std::)?string)\s+([^;{}()/]+);/g;

// Detect first literal in a cout chain to use as prompt text.
const STRING_LITERAL_RE = /"((?:[^"\\]|\\.)*)"/g;

// Manipulators and non-variable tokens to ignore in cin chains
const CIN_IGNORE_TOKENS = new Set([
  'std::ws','ws','std::endl','endl','std::hex','hex','std::dec','dec',
  'std::oct','oct','std::fixed','fixed','std::scientific','scientific',
  'std::boolalpha','boolalpha','std::noboolalpha','noboolalpha',
  'std::skipws','skipws','std::noskipws','noskipws'
]);

type FieldType = InputItem["fields"][number]["type"];

// Map C++ primitive to our field types
function mapCppType(tok: string): FieldType {
  tok = tok.replace(/\s+/g,' ').replace(/^std::/,'').toLowerCase();
  if (tok === 'bool') return 'boolean';
  if (tok === 'char') return 'char';
  if (tok === 'float') return 'float';
  if (tok === 'double' || tok === 'long double') return 'double';
  if (tok === 'string') return 'string';
  if (tok === 'int' || tok === 'long' || tok === 'long long' || tok === 'short') return 'int';
  return 'unknown';
}

// Build a var->type map from declarations appearing before `uptoIdx`
function buildTypeEnv(source: string, uptoIdx: number): Record<string, FieldType> {
  const env: Record<string, FieldType> = {};
  let m: RegExpExecArray | null;
  CPP_DECL_RE.lastIndex = 0;

  // Scan only the prefix for speed and correctness
  const prefix = source.slice(0, Math.max(0, uptoIdx));
  while ((m = CPP_DECL_RE.exec(prefix))) {
    const fullDecl = m[0];
    const typeMatch = fullDecl.match(/\b(?:bool|char|int|long\s+long|long|float|double|(?:std::)?string)\b/i);
    if (!typeMatch) continue;

    const baseType = mapCppType(typeMatch[0]);
    // Split declared names: int a, b=5, c;
    const names = m[1]
      .split(',')
      .map(s => s.trim())
      .map(s => s.replace(/\s*=\s*[^,]+$/,''))
      .map(s => s.replace(/\[\s*\d*\s*\]$/,'')) // ignore simple arrays like int a[10]
      .filter(Boolean);

    for (const n of names) {
      const varName = (n.match(/^([A-Za-z_]\w*)/) || [,''])[1];
      if (varName) env[varName] = baseType;
    }
  }
  return env;
}

// Extract first literal inside a cout chain (best proxy for prompt)
function firstPromptFromCout(chain: string): string | undefined {
  let s: RegExpExecArray | null;
  STRING_LITERAL_RE.lastIndex = 0;
  if ((s = STRING_LITERAL_RE.exec(chain))) return s[1];
  return undefined;
}

// Tokenize a cin chain by >> and filter only plausible variable names
function varsFromCinChain(chain: string): string[] {
  return chain
    .split(/>>/g)
    .map(t => t.trim())
    .filter(Boolean)
    // Drop parentheses and function calls like (x) or func(y)
    .map(t => t.replace(/^\(+|\)+$/g,''))
    .filter(t => !CIN_IGNORE_TOKENS.has(t))
    .filter(t => !/^".*"$/.test(t) && !/^'.*'$/.test(t))
    .filter(t => /^[A-Za-z_]\w*$/.test(t));
}

export function parseCppInteractiveInputs(source: string): InputItem[] {
  const items: InputItem[] = [];
  const coutAnchors: Array<{ index: number; prompt?: string }> = [];

  // 1) Collect cout chains to later attach prompts
  let cm: RegExpExecArray | null;
  CPP_COUT_CHAIN_RE.lastIndex = 0;
  while ((cm = CPP_COUT_CHAIN_RE.exec(source))) {
    if (cm.index == null) continue;
    const chain = cm[2] || '';
    coutAnchors.push({ index: cm.index, prompt: firstPromptFromCout(chain) });
  }

  // helper: find nearest preceding prompt within window
  const nearestPrompt = (idx: number, window = 400): string | undefined => {
    let best: string | undefined;
    for (let i = coutAnchors.length - 1; i >= 0; i--) {
      const c = coutAnchors[i];
      if (c.index < idx && idx - c.index <= window) {
        best = c.prompt;
        break;
      }
    }
    return best;
  };

  // 2) std::getline occurrences (newline-style string inputs)
  let gm: RegExpExecArray | null;
  CPP_GETLINE_RE.lastIndex = 0;
  while ((gm = CPP_GETLINE_RE.exec(source))) {
    const idx = gm.index || 0;
    const varName = gm[1];
    const env = buildTypeEnv(source, idx);
    const prompt = nearestPrompt(idx);

    items.push({
      id: "cin-" + idx,
      lang: "cpp",
      rawCall: gm[0],
      spec: `getline(${varName})`,
      vars: [varName],
      fields: [{ fmt: varName, type: env[varName] || 'string' }],
      prompt,
      separator: "newline"
    });
  }

  // 3) cin >> a >> b; chains (space-separated)
  let im: RegExpExecArray | null;
  CPP_CIN_CHAIN_RE.lastIndex = 0;
  while ((im = CPP_CIN_CHAIN_RE.exec(source))) {
    const idx = im.index || 0;
    const chain = im[2] || '';
    const vars = varsFromCinChain(chain);
    if (!vars.length) continue;

    const env = buildTypeEnv(source, idx);
    const fields = vars.map(v => ({ fmt: v, type: env[v] || 'unknown' }));
    const prompt = nearestPrompt(idx);

    items.push({
      id: "cin-" + idx,
      lang: "cpp",
      rawCall: im[0],
      spec: chain,
      vars,
      fields,
      prompt,
      separator: "space"
    });
  }

  // Sort by appearance
  return items.sort((a, b) => parseInt(a.id.slice(4)) - parseInt(b.id.slice(4)));
}


// ============= Java Parser =============
// before
// const JAVA_PRINTLN_RE = /System\.out\.println?\s*\(\s*"([^"]+)"\s*\)/g;

// after: matches print OR println, also supports printf, escaped quotes, optional semicolon
const JAVA_PRINT_RE =
  /System\.out\.(?:print(?:ln)?|printf)\s*\(\s*(?:"((?:[^"\\]|\\.)*)"|[^)]*)\s*\);?/g;

// keep your scanner regex but consider more aliases if you like
const JAVA_SCANNER_RE =
  /(?:scanner|sc|scan|input)\.(?:nextInt|nextDouble|nextFloat|nextLine|next|nextBoolean)\s*\(\s*\)/gi;

export function parseJavaInteractiveInputs(source: string): InputItem[] {
  const items: InputItem[] = [];
  const printMatches: Array<{ index: number; spec: string }> = [];

  // collect nearest preceding print/println/printf messages
  let pm: RegExpExecArray | null;
  JAVA_PRINT_RE.lastIndex = 0;
  while ((pm = JAVA_PRINT_RE.exec(source))) {
    // pm[1] is only set when the first arg is a plain string literal
    if (pm.index == null) continue;
    if (pm[1]) {
      printMatches.push({ index: pm.index, spec: pm[1] });
    }
  }

  let m: RegExpExecArray | null;
  JAVA_SCANNER_RE.lastIndex = 0;
  while ((m = JAVA_SCANNER_RE.exec(source))) {
    const idx = m.index || 0;
    const call = m[0];

    let type: InputItem["fields"][number]["type"] = "unknown";
    if (/nextInt/i.test(call)) type = "int";
    else if (/nextDouble/i.test(call)) type = "double";
    else if (/nextFloat/i.test(call)) type = "float";
    else if (/nextBoolean/i.test(call)) type = "boolean";
    else if (/nextLine|next(?!\w)/i.test(call)) type = "string";

    // try to grab the variable on the left of '='
    const varMatch = source.slice(Math.max(0, idx - 80), idx).match(/(\w+)\s*=\s*$/);
    const varName = varMatch ? varMatch[1] : "input";

    // find the closest preceding print within a reasonable window
    let prompt: string | undefined;
    const near = printMatches.filter(p => p.index < idx).pop();
    if (near && idx - near.index < 400) prompt = near.spec; // widened window

    items.push({
      id: "scanner-" + idx,
      lang: "java",
      rawCall: call,
      spec: call,
      vars: [varName],
      fields: [{ fmt: varName, type }],
      prompt,
      separator: "newline",
    });
  }

  return items;
}


// ============= Python Parser (Corrected) =============
const PYTHON_INPUT_RE = /(?:(\w+)\s*=\s*)?input\s*\(\s*(?:"([^"]+)"|'([^']+)')?\s*\)/g;
const PYTHON_INT_INPUT_RE = /(?:(\w+)\s*=\s*)?int\s*\(\s*input\s*\(\s*(?:"([^"]+)"|'([^']+)')?\s*\)\s*\)/g;
const PYTHON_FLOAT_INPUT_RE = /(?:(\w+)\s*=\s*)?float\s*\(\s*input\s*\(\s*(?:"([^"]+)"|'([^']+)')?\s*\)\s*\)/g;

// Define the type for the input items if not already defined elsewhere
// interface InputItem {
//   id: string;
//   lang: string;
//   rawCall: string;
//   spec: string;
//   vars: string[];
//   fields: { fmt: string; type: "int" | "float" | "string" }[];
//   prompt: string | undefined;
//   separator: string;
// }

export function parsePythonInteractiveInputs(source: string): InputItem[] {
  const items: InputItem[] = [];
  // Store ranges [startIndex, endIndex] of matches we've already handled
  const seenRanges: [number, number][] = [];

  // Helper function to check if a new match is already inside a previous, larger match
  const isRangeCovered = (startIndex: number, endIndex: number): boolean => {
    for (const [start, end] of seenRanges) {
      if (startIndex >= start && endIndex <= end) {
        return true; // This range is already covered
      }
    }
    return false;
  };

  let m: RegExpExecArray | null;

  // The order is important: process the most specific regexes first.

  // Parse int(input(...))
  PYTHON_INT_INPUT_RE.lastIndex = 0;
  while ((m = PYTHON_INT_INPUT_RE.exec(source))) {
    const idx = m.index;
    const endIdx = idx + m[0].length;
    const varName = m[1] || "num";
    const prompt = m[2] || m[3];

    // No need to check if covered, as this is the first and most specific pass
    items.push({
      id: "input-" + idx,
      lang: "python",
      rawCall: m[0],
      spec: m[0],
      vars: [varName],
      fields: [{ fmt: varName, type: "int" }],
      prompt,
      separator: "newline",
    });
    seenRanges.push([idx, endIdx]); // Record the range of this match
  }

  // Parse float(input(...))
  PYTHON_FLOAT_INPUT_RE.lastIndex = 0;
  while ((m = PYTHON_FLOAT_INPUT_RE.exec(source))) {
    const idx = m.index;
    const endIdx = idx + m[0].length;
    
    // Skip if this match is already part of a previous one (unlikely but good practice)
    if (isRangeCovered(idx, endIdx)) continue;

    const varName = m[1] || "num";
    const prompt = m[2] || m[3];

    items.push({
      id: "input-" + idx,
      lang: "python",
      rawCall: m[0],
      spec: m[0],
      vars: [varName],
      fields: [{ fmt: varName, type: "float" }],
      prompt,
      separator: "newline",
    });
    seenRanges.push([idx, endIdx]); // Record the range of this match
  }

  // Parse plain input(...) — only if this exact site wasn't already taken
  PYTHON_INPUT_RE.lastIndex = 0;
  while ((m = PYTHON_INPUT_RE.exec(source))) {
    const idx = m.index;
    const endIdx = idx + m[0].length;

    // CRUCIAL FIX: Check if the range of this plain input() match is already covered
    if (isRangeCovered(idx, endIdx)) continue;

    const varName = m[1] || "text";
    const prompt = m[2] || m[3];

    items.push({
      id: "input-" + idx,
      lang: "python",
      rawCall: m[0],
      spec: m[0],
      vars: [varName],
      fields: [{ fmt: varName, type: "string" }],
      prompt,
      separator: "newline",
    });
    seenRanges.push([idx, endIdx]); // Record the range of this match
  }

  return items.sort((a, b) => Number(a.id.slice(6)) - Number(b.id.slice(6)));
}


// ============= JavaScript Parser =============

// console prompts near inputs
const JS_CONSOLE_PRINT_RE =
  /console\.(?:log|info|warn)\s*\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')\s*\)\s*;?/g;

// rl.question("prompt", cb)
const JS_RL_QUESTION_RE =
  /(\w+)\.question\s*\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')\s*,/g;

// browser prompt("prompt")
const JS_BROWSER_PROMPT_RE =
  /(?:const|let|var)\s+(\w+)\s*=\s*prompt\s*\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')?\s*\)\s*;?/g;

// readline-sync: const rl = require('readline-sync'); const x = rl.question('..')
const JS_RLSYNC_QUESTION_RE =
  /(\w+)\.question\s*\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')\s*\)/g;

// common numeric wrappers applied to answers, e.g. Number(prompt(...)) or parseInt(answer)
const JS_NUM_WRAP_RE =
  /\b(?:Number|parseInt|parseFloat)\s*\(\s*([^)]+)\s*\)/g;

type JSType = InputItem["fields"][number]["type"];

function guessType(expr: string): JSType {
  if (/\bparseInt\b|\bNumber\b/.test(expr)) return "int";
  if (/\bparseFloat\b/.test(expr)) return "float";
  return "string";
}

export function parseJavaScriptInteractiveInputs(source: string): InputItem[] {
  const items: InputItem[] = [];
  const consolePrompts: Array<{ index: number; text: string }> = [];

  // collect console.log/info/warn as possible nearby prompts
  let m: RegExpExecArray | null;
  JS_CONSOLE_PRINT_RE.lastIndex = 0;
  while ((m = JS_CONSOLE_PRINT_RE.exec(source))) {
    if (m.index == null) continue;
    const text = m[1] ?? m[2];
    if (!text) continue;
    consolePrompts.push({ index: m.index, text });
  }

  const pushItem = (idx: number, raw: string, varName: string, prompt?: string, type: JSType = "string") => {
    // infer type if wrapped in Number/parseX
    const wrapped = source.slice(Math.max(0, idx - 120), idx) + raw + source.slice(idx, idx + 120);
    let finalType = type;
    let numMatch: RegExpExecArray | null;
    JS_NUM_WRAP_RE.lastIndex = 0;
    while ((numMatch = JS_NUM_WRAP_RE.exec(wrapped))) {
      if (numMatch[1] && numMatch[1].includes(raw)) {
        finalType = guessType(numMatch[0]);
        break;
      }
    }

    // nearest preceding console.* prompt within ~300 chars
    if (!prompt) {
      const near = consolePrompts.filter(p => p.index < idx).pop();
      if (near && idx - near.index < 300) prompt = near.text;
    }

    items.push({
      id: "input-" + idx,
      lang: "javascript",
      rawCall: raw,
      spec: raw,
      vars: [varName || "input"],
      fields: [{ fmt: varName || "input", type: finalType }],
      prompt,
      separator: "newline",
    });
  };

  // rl.question("..", cb)
  JS_RL_QUESTION_RE.lastIndex = 0;
  while ((m = JS_RL_QUESTION_RE.exec(source))) {
    const idx = m.index || 0;
    const prompt = m[2] || m[3];
    // try to find assigned var inside immediate callback signature: (answer) => { const x = ... }
    // fallback var name
    const varName = "answer";
    pushItem(idx, m[0], varName, prompt, "string");
  }

  // readline-sync question
  JS_RLSYNC_QUESTION_RE.lastIndex = 0;
  while ((m = JS_RLSYNC_QUESTION_RE.exec(source))) {
    const idx = m.index || 0;
    const prompt = m[2] || m[3];
    // look back for "const x = rl.question(" to get x
    const back = source.slice(Math.max(0, idx - 100), idx);
    const varMatch = back.match(/(?:const|let|var)\s+(\w+)\s*=\s*$/);
    const varName = varMatch ? varMatch[1] : "input";
    pushItem(idx, m[0], varName, prompt, "string");
  }

  // browser prompt
  JS_BROWSER_PROMPT_RE.lastIndex = 0;
  while ((m = JS_BROWSER_PROMPT_RE.exec(source))) {
    const idx = m.index || 0;
    const varName = m[1] || "input";
    const prompt = m[2] || m[3];
    pushItem(idx, m[0], varName, prompt, "string");
  }

  return items.sort((a, b) => parseInt(a.id.slice(6)) - parseInt(b.id.slice(6)));
}


// ============= Main Parser =============
export function parseInteractiveInputs(
  source: string,
  languageId: number
): InputItem[] {
  // Judge0 language IDs
  // 50: C (GCC 9.2.0)
  // 54: C++ (GCC 9.2.0)
  // 62: Java (OpenJDK 13.0.1)
  // 71: Python (3.8.1)
  // 63: JavaScript (Node.js 12.14.0)

  switch (languageId) {
    case 50: // C
    case 75: // C (Clang 7.0.1)
      return parseCInteractiveInputs(source);
    
    case 54: // C++
    case 76: // C++ (Clang 7.0.1)
      return parseCppInteractiveInputs(source);
    
    case 62: // Java
      return parseJavaInteractiveInputs(source);
    
    case 71: // Python
    case 70: // Python 2
      return parsePythonInteractiveInputs(source);
    
    case 63: // JavaScript
    case 93: // JavaScript (Node.js 18.15.0)
      return parseJavaScriptInteractiveInputs(source);
    
    default:
      return [];
  }
}

// ============= Build stdin =============
export function buildStdin(items: InputItem[], answers: string[]): string {
  const chunks: string[] = [];
  let i = 0;
  for (const it of items) {
    const n = it.fields.length;
    const part = answers.slice(i, i + n);
    chunks.push(part.join(it.separator === "newline" ? "\n" : " "));
    i += n;
  }
  return chunks.join("\n");
}