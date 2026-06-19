import { AutomataCore, type Transition, type PDATransition, type TMTransition, type Production } from './automata-core';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_KEY || '';
const MAX_RETRIES = 3;

interface DFAIResult {
  valid: boolean; type: 'DFA'; explanation: string;
  data: { states: string[]; alphabet: string[]; startState: string; acceptStates: string[]; transitions: Transition[] };
}
interface NFAIResult {
  valid: boolean; type: 'NFA'; explanation: string;
  data: { states: string[]; alphabet: string[]; startState: string; acceptStates: string[]; transitions: Transition[] };
}
interface CFGIResult {
  valid: boolean; type: 'CFG'; explanation: string;
  data: { variables: string[]; terminals: string[]; startSymbol: string; productions: Production[] };
}
interface PDAIResult {
  valid: boolean; type: 'PDA'; explanation: string;
  data: { states: string[]; inputAlphabet: string[]; stackAlphabet: string[]; startState: string; startStackSymbol: string; acceptStates: string[]; transitions: PDATransition[] };
}
interface TMIResult {
  valid: boolean; type: 'TM'; explanation: string;
  data: { states: string[]; inputAlphabet: string[]; tapeAlphabet: string[]; startState: string; acceptState: string; rejectState: string; transitions: TMTransition[] };
}

type AnyResult = DFAIResult | NFAIResult | CFGIResult | PDAIResult | TMIResult;

function extractJSON(text: string): any {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  const start = jsonStr.indexOf('{');
  const end = jsonStr.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  return JSON.parse(jsonStr.slice(start, end + 1));
}

function validateResult(result: AnyResult, type: string): { valid: boolean; errors: string[] } {
  const d = result.data as any;
  let validation;
  if (type === 'DFA') {
    validation = AutomataCore.validateDFA({
      states: d.states?.join(','),
      alphabet: d.alphabet?.join(','),
      startState: d.startState,
      acceptStates: d.acceptStates?.join(','),
      transitions: d.transitions?.map((t: any) => `${t.from},${t.symbol},${t.to}`).join('\n')
    });
  } else if (type === 'NFA') {
    validation = AutomataCore.validateNFA({
      states: d.states?.join(','),
      alphabet: d.alphabet?.join(','),
      startState: d.startState,
      acceptStates: d.acceptStates?.join(','),
      transitions: d.transitions?.map((t: any) => `${t.from},${t.symbol},${t.to}`).join('\n')
    });
  } else if (type === 'CFG') {
    validation = AutomataCore.validateCFG({
      variables: d.variables?.join(','),
      terminals: d.terminals?.join(','),
      startSymbol: d.startSymbol,
      productions: d.productions?.map((p: any) => `${p.variable}->${p.production}`).join('\n')
    });
  } else if (type === 'PDA') {
    validation = AutomataCore.validatePDA({
      states: d.states?.join(','),
      inputAlphabet: d.inputAlphabet?.join(','),
      stackAlphabet: d.stackAlphabet?.join(','),
      startState: d.startState,
      startStackSymbol: d.startStackSymbol,
      acceptStates: d.acceptStates?.join(','),
      transitions: d.transitions?.map((t: any) => `${t.from},${t.input},${t.stackTop},${t.to},${t.stackPush}`).join('\n')
    });
  } else if (type === 'TM') {
    validation = AutomataCore.validateTM({
      states: d.states?.join(','),
      inputAlphabet: d.inputAlphabet?.join(','),
      tapeAlphabet: d.tapeAlphabet?.join(','),
      startState: d.startState,
      acceptState: d.acceptState,
      rejectState: d.rejectState,
      transitions: d.transitions?.map((t: any) => `${t.from},${t.read},${t.to},${t.write},${t.direction}`).join('\n')
    });
  } else {
    return { valid: false, errors: [`Unsupported type: ${type}`] };
  }
  return { valid: validation.valid, errors: validation.errors };
}

function formatDescription(data: any, type: string): string {
  if (type === 'CFG') {
    const prodStr = (data.productions || []).map((p: any) => `  ${p.variable} → ${p.production}`).join('\n');
    return `Variables: ${data.variables?.join(', ')}\nTerminals: ${data.terminals?.join(', ')}\nStart: ${data.startSymbol}\nProductions:\n${prodStr}`;
  }
  if (type === 'DFA' || type === 'NFA') {
    const transStr = (data.transitions || []).map((t: any) => `  ${t.from} --${t.symbol}--> ${t.to}`).join('\n');
    return `States: ${data.states?.join(', ')}\nAlphabet: ${data.alphabet?.join(', ')}\nStart: ${data.startState}\nAccept: ${data.acceptStates?.join(', ')}\nTransitions:\n${transStr}`;
  }
  return '';
}

export class AutomataAI {
  static async generateFromQuestion(question: string, type: 'DFA'): Promise<DFAIResult>;
  static async generateFromQuestion(question: string, type: 'NFA'): Promise<NFAIResult>;
  static async generateFromQuestion(question: string, type: 'CFG'): Promise<CFGIResult>;
  static async generateFromQuestion(question: string, type: 'PDA'): Promise<PDAIResult>;
  static async generateFromQuestion(question: string, type: 'TM'): Promise<TMIResult>;
  static async generateFromQuestion(question: string, type: string): Promise<AnyResult> {
    try {
      return await this.generateWithGroq(question, type, MAX_RETRIES);
    } catch {
      return this.generateFromLocalPrompt(question, type);
    }
  }

  private static async generateWithGroq(question: string, type: string, retries: number): Promise<AnyResult> {
    if (!GROQ_API_KEY) throw new Error('Groq API key not configured. Add NEXT_PUBLIC_GROQ_KEY to .env.local');

    const systemPrompt = this.getSystemPrompt(type);
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages,
        temperature: 0.1,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Groq API Error (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const result = this.processAIResult(extractJSON(content), type);

    const validation = validateResult(result, type);
    if (!validation.valid && retries > 0) {
      const d = result.data as any;
      const currentDesc = formatDescription(d, type);
      return this.generateWithGroq(
        `I need a ${type} for: "${question}"\n\nYour previous attempt had these validation errors:\n${validation.errors.join('\n')}\n\nHere is what you gave before:\n${currentDesc}\n\nPlease fix ALL errors and create a correct ${type}. Follow the reasoning template step by step.`,
        type,
        retries - 1
      );
    }

    return result;
  }

  private static getSystemPrompt(type: string) {
    const base = `You are an expert Automata Theory professor. You MUST follow the REASONING TEMPLATE below step by step, then output the final JSON.

## REASONING TEMPLATE (MUST FOLLOW EVERY STEP)

### Step 1: Language Analysis
- What strings should this grammar/automaton generate or accept?
- What strings should it reject or not generate?
- Identify the key pattern or property.

### Step 2: Structure Design
- Design the components (states, variables, or transitions) needed.
- Label everything clearly (q0, q1, ... or S, A, B, ...).
- Explain what each component represents.

### Step 3: Definition Design
- Write out all transitions / productions / rules completely.
- Ensure nothing is missing.

### Step 4: Verification
- Check all structural rules are satisfied.
- Trace a few example strings to verify correctness.`;

    if (type === 'CFG') {
      return base + `

## SOLVED EXAMPLE 1: "CFG for balanced parentheses"

Step 1: Language Analysis
- Generate strings like "", "()", "(())", "()()", "((()))", ...
- The number of opening and closing parens must be equal.
- At no prefix should closing parens exceed opening parens.

Step 2: Structure Design
- One variable S is enough.
- S can expand in two ways: nest or concatenate.

Step 3: Productions
S → (S)   (nesting)
S → SS    (concatenation)
S → ε     (base case — empty string)

Step 4: Verification
- "" → S ✓
- "()" → S → (S) → () ✓
- "()()" → S → SS → (S)S → ()S → ()(S) → ()() ✓
- "(())" → S → (S) → ((S)) → (()) ✓

## SOLVED EXAMPLE 2: "CFG for a^n b^n"

Step 1: Language Analysis
- Generate strings like "", "ab", "aabb", "aaabbb", ...
- Equal number of 'a's followed by 'b's.

Step 2: Structure Design
- One variable S.
- Each production adds one 'a' at start and one 'b' at end.

Step 3: Productions
S → aSb
S → ε

Step 4: Verification
- "" → S ✓
- "ab" → S → aSb → ab ✓
- "aabb" → S → aSb → aaSbb → aabb ✓

## OUTPUT FORMAT FOR CFG

\`\`\`json
{
  "explanation": "Step 1: Language Analysis...\\nStep 2: Structure Design...\\nStep 3: Productions...\\nStep 4: Verification...",
  "data": {
    "variables": "S",
    "terminals": "(, )",
    "startSymbol": "S",
    "productions": "S->(S)\\nS->SS\\nS->ε"
  }
}
\`\`\`

## CRITICAL RULES FOR CFG
- Variables are uppercase by convention (S, A, B, ...). Terminals are lowercase or symbols.
- Variables and terminals MUST NOT overlap (no symbol can be both).
- Use "->" or "→" between variable and its production in the string format.
- Use \\n between production lines.
- Use ε for empty string productions.
- Every variable used on the right side must be in the variables list.
- Every terminal used in productions must be in the terminals list.
- The start symbol must be one of the variables.
- Productions field format: each line is "Variable->production" (e.g., "S->aSb" or "A->ε")

Requested type: ${type}

IMPORTANT: Wrap the entire JSON in \`\`\`json ... \`\`\` markers.`;
    }

    if (type === 'DFA') {
      return base + `

## SOLVED EXAMPLE 1: "DFA that accepts strings ending with 01 over {0,1}"

Step 1: Language Analysis
- Accept: strings ending with "01" (e.g., "01", "101", "00101")
- Reject: strings not ending with "01" (e.g., "", "0", "1", "10", "00", "11")

Step 2: State Design
- q0: reset / last seen "1" (no partial match)
- q1: last seen "0" (partial match, expecting "1")
- q2: completed "01" (accept)

Step 3: Transitions
From q0:
  on 0 → q1   on 1 → q0
From q1:
  on 0 → q1   on 1 → q2
From q2:
  on 0 → q1   on 1 → q0

Step 4: Accept States: q2
Verification: q0 has 0→q1,1→q0 ✓ | q1: 0→q1,1→q2 ✓ | q2: 0→q1,1→q0 ✓

## SOLVED EXAMPLE 2: "DFA that accepts strings where the number of 0s is even"

Step 1: Language Analysis
- Accept: even count of 0s (e.g., "", "1", "00", "11", "001", "010")
- Reject: odd count of 0s (e.g., "0", "01", "10", "000")

Step 2: State Design
- q0: even 0s (accept)
- q1: odd 0s

Step 3: Transitions
From q0: on 0 → q1  on 1 → q0
From q1: on 0 → q0  on 1 → q1

Step 4: Accept States: q0

Requested type: ${type}

IMPORTANT: Wrap the entire JSON in \`\`\`json ... \`\`\` markers.`;
    }

    return base + `

## OUTPUT FORMAT

For NFA:
\`\`\`json
{
  "explanation": "Step 1:...\\nStep 2:...\\nStep 3:...",
  "data": {
    "states": "q0,q1",
    "alphabet": "0,1",
    "startState": "q0",
    "acceptStates": "q1",
    "transitions": "q0,0,q0\\nq0,0,q1\\nq0,1,q0\\nq1,1,q1"
  }
}
\`\`\`

For PDA:
\`\`\`json
{
  "explanation": "...",
  "data": {
    "states": "q0,q1,q2",
    "inputAlphabet": "a,b",
    "stackAlphabet": "Z,X",
    "startState": "q0",
    "startStackSymbol": "Z",
    "acceptStates": "q2",
    "transitions": "q0,a,Z,q0,XZ\\nq0,a,X,q0,XX\\nq0,b,X,q1,ε\\nq1,b,X,q1,ε\\nq1,ε,Z,q2,Z"
  }
}
\`\`\`

For TM:
\`\`\`json
{
  "explanation": "...",
  "data": {
    "states": "q0,qa,qr",
    "inputAlphabet": "0,1",
    "tapeAlphabet": "0,1,B",
    "startState": "q0",
    "acceptState": "qa",
    "rejectState": "qr",
    "transitions": "q0,0,q1,X,R\\nq1,0,q1,0,R\\nq1,1,q2,Y,L\\nq2,0,q2,0,L\\nq2,X,q0,X,R\\nq0,Y,qa,Y,S"
  }
}
\`\`\`

## GENERAL RULES
- Every component used in transitions/productions must be defined.
- Use \\n between lines in string fields.
- Fix any errors before outputting the final JSON.

Requested type: ${type}

IMPORTANT: Wrap the entire JSON in \`\`\`json ... \`\`\` markers.`;
  }

  private static processAIResult(result: any, type: string): AnyResult {
    const d = result.data;
    if (type === 'DFA') return this.createDFA(d.states, d.alphabet, d.startState, d.acceptStates, d.transitions, result.explanation);
    if (type === 'NFA') return this.createNFA(d.states, d.alphabet, d.startState, d.acceptStates, d.transitions, result.explanation);
    if (type === 'CFG') return this.createCFG(d.variables, d.terminals, d.startSymbol, d.productions, result.explanation);
    if (type === 'PDA') return this.createPDA(d.states, d.inputAlphabet, d.stackAlphabet, d.startState, d.startStackSymbol, d.acceptStates, d.transitions, result.explanation);
    if (type === 'TM') return this.createTM(d.states, d.inputAlphabet, d.tapeAlphabet, d.startState, d.acceptState, d.rejectState, d.transitions, result.explanation);
    throw new Error(`Unsupported type: ${type}`);
  }

  private static async generateFromLocalPrompt(question: string, type: string): Promise<AnyResult> {
    const q = question.toLowerCase().trim();
    await new Promise(resolve => setTimeout(resolve, 500));
    const note = "\n\n(Note: Generated using local matching engine)";

    if (type === 'CFG') {
      if (q.includes('palindrom')) return this.createCFG('S', 'a,b', 'S', 'S->aSa\nS->bSb\nS->a\nS->b\nS->ε', "Palindromes over {a,b}." + note);
      if (q.includes('parenthes') || (q.includes('balanced') && q.includes('('))) return this.createCFG('S', '(, )', 'S', 'S->(S)\nS->SS\nS->ε', "Balanced parentheses." + note);
      if (q.includes("a^n") && q.includes("b^n")) return this.createCFG('S', 'a,b', 'S', 'S->aSb\nS->ε', "a^n b^n." + note);
      if (q.includes('arithmetic') || q.includes('expression')) return this.createCFG('E,T,F', '+,*, (, ), id', 'E', 'E->E+T\nE->T\nT->T*F\nT->F\nF->(E)\nF->id', "Arithmetic expressions." + note);
    }

    if (type === 'DFA') {
      if (q.includes('even') && q.includes('0')) return this.createDFA('q0,q1', '0,1', 'q0', 'q0', 'q0,0,q0\nq0,1,q1\nq1,0,q0\nq1,1,q1', "Even number of 0s." + note);
      if (q.includes('odd') && q.includes('0')) return this.createDFA('q0,q1', '0,1', 'q0', 'q1', 'q0,0,q1\nq0,1,q0\nq1,0,q0\nq1,1,q1', "Odd number of 0s." + note);
      if (q.includes('starts with') && q.includes('0')) return this.createDFA('q0,q1,q_dead', '0,1', 'q0', 'q1', 'q0,0,q1\nq0,1,q_dead\nq1,0,q1\nq1,1,q1\nq_dead,0,q_dead\nq_dead,1,q_dead', "Starts with 0." + note);
      if (q.includes('contains') && q.includes('101')) return this.createDFA('q0,q1,q2,q3', '0,1', 'q0', 'q3', 'q0,0,q0\nq0,1,q1\nq1,0,q2\nq1,1,q1\nq2,0,q0\nq2,1,q3\nq3,0,q3\nq3,1,q3', "Contains 101." + note);
    }

    if (type === 'NFA' && q.includes('ends with') && q.includes('01')) {
      return this.createNFA('q0,q1,q2', '0,1', 'q0', 'q2', 'q0,0,q0\nq0,1,q0\nq0,0,q1\nq1,1,q2', "Ends with 01." + note);
    }

    if (type === 'PDA' && q.includes("a^n") && q.includes("b^n")) {
      return this.createPDA('q0,q1,q2', 'a,b', 'Z,X', 'q0', 'Z', 'q2', 'q0,a,Z,q0,XZ\nq0,a,X,q0,XX\nq0,b,X,q1,ε\nq1,b,X,q1,ε\nq1,ε,Z,q2,Z', "a^n b^n PDA." + note);
    }

    if (type === 'TM' && q.includes("0^n") && q.includes("1^n")) {
      return this.createTM('q0,q1,q2,q3,q4,qa,qr', '0,1', '0,1,X,Y,B', 'q0', 'qa', 'qr', 'q0,0,q1,X,R\nq1,0,q1,0,R\nq1,Y,q1,Y,R\nq1,1,q2,Y,L\nq2,0,q2,0,L\nq2,Y,q2,Y,L\nq2,X,q0,X,R\nq0,Y,q3,Y,R\nq3,Y,q3,Y,R\nq3,B,qa,B,R', "0^n 1^n TM." + note);
    }

    throw new Error(`No matching pattern found for "${question}". Try 'palindromes', 'balanced parentheses', etc.`);
  }

  private static createDFA(states: string, alphabet: string, start: string, accept: string, transitions: string, explanation: string): DFAIResult {
    return { valid: true, type: 'DFA', explanation, data: { states: AutomataCore.parseCommaSeparated(states), alphabet: AutomataCore.parseCommaSeparated(alphabet), startState: start, acceptStates: AutomataCore.parseCommaSeparated(accept), transitions: AutomataCore.parseTransitions(transitions) } };
  }

  private static createNFA(states: string, alphabet: string, start: string, accept: string, transitions: string, explanation: string): NFAIResult {
    return { valid: true, type: 'NFA', explanation, data: { states: AutomataCore.parseCommaSeparated(states), alphabet: AutomataCore.parseCommaSeparated(alphabet), startState: start, acceptStates: AutomataCore.parseCommaSeparated(accept), transitions: AutomataCore.parseTransitions(transitions) } };
  }

  private static createCFG(variables: string, terminals: string, start: string, productions: string, explanation: string): CFGIResult {
    return { valid: true, type: 'CFG', explanation, data: { variables: AutomataCore.parseCommaSeparated(variables), terminals: AutomataCore.parseCommaSeparated(terminals), startSymbol: start, productions: AutomataCore.parseProductions(productions) } };
  }

  private static createPDA(states: string, inputAlpha: string, stackAlpha: string, start: string, startStack: string, accept: string, transitions: string, explanation: string): PDAIResult {
    return { valid: true, type: 'PDA', explanation, data: { states: AutomataCore.parseCommaSeparated(states), inputAlphabet: AutomataCore.parseCommaSeparated(inputAlpha), stackAlphabet: AutomataCore.parseCommaSeparated(stackAlpha), startState: start, startStackSymbol: startStack, acceptStates: AutomataCore.parseCommaSeparated(accept), transitions: AutomataCore.parsePDATransitions(transitions) } };
  }

  private static createTM(states: string, inputAlpha: string, tapeAlpha: string, start: string, accept: string, reject: string, transitions: string, explanation: string): TMIResult {
    return { valid: true, type: 'TM', explanation, data: { states: AutomataCore.parseCommaSeparated(states), inputAlphabet: AutomataCore.parseCommaSeparated(inputAlpha), tapeAlphabet: AutomataCore.parseCommaSeparated(tapeAlpha), startState: start, acceptState: accept, rejectState: reject, transitions: AutomataCore.parseTMTransitions(transitions) } };
  }
}
