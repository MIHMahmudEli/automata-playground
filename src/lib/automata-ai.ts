import { AutomataCore, type Transition, type PDATransition, type TMTransition } from './automata-core';

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
interface PDAIResult {
  valid: boolean; type: 'PDA'; explanation: string;
  data: { states: string[]; inputAlphabet: string[]; stackAlphabet: string[]; startState: string; startStackSymbol: string; acceptStates: string[]; transitions: PDATransition[] };
}
interface TMIResult {
  valid: boolean; type: 'TM'; explanation: string;
  data: { states: string[]; inputAlphabet: string[]; tapeAlphabet: string[]; startState: string; acceptState: string; rejectState: string; transitions: TMTransition[] };
}

type AnyResult = DFAIResult | NFAIResult | PDAIResult | TMIResult;

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

function formatDFADescription(data: any): string {
  const parts = [
    `States: ${data.states?.join(', ')}`,
    `Alphabet: ${data.alphabet?.join(', ')}`,
    `Start: ${data.startState}`,
    `Accept: ${data.acceptStates?.join(', ')}`,
    `Transitions (${data.transitions?.length || 0}):`,
    ...(data.transitions || []).map((t: any) => `  ${t.from} --${t.symbol}--> ${t.to}`)
  ];
  return parts.join('\n');
}

export class AutomataAI {
  static async generateFromQuestion(question: string, type: 'DFA'): Promise<DFAIResult>;
  static async generateFromQuestion(question: string, type: 'NFA'): Promise<NFAIResult>;
  static async generateFromQuestion(question: string, type: 'PDA'): Promise<PDAIResult>;
  static async generateFromQuestion(question: string, type: 'TM'): Promise<TMIResult>;
  static async generateFromQuestion(question: string, type: string): Promise<AnyResult> {
    try {
      return await this.generateWithGroq(question, type, MAX_RETRIES);
    } catch {
      const local = this.generateFromLocalPrompt(question, type);
      return local;
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
      const currentDFA = formatDFADescription(d);
      return this.generateWithGroq(
        `I need a ${type} for: "${question}"\n\nYour previous attempt had these validation errors:\n${validation.errors.join('\n')}\n\nHere is what you gave before:\n${currentDFA}\n\nPlease fix ALL errors and create a correct ${type}. Follow the reasoning template step by step.`,
        type,
        retries - 1
      );
    }

    return result;
  }

  private static getSystemPrompt(type: string) {
    return `You are an expert Automata Theory professor. You MUST follow the REASONING TEMPLATE below step by step, then output the final JSON.

## REASONING TEMPLATE (MUST FOLLOW EVERY STEP)

### Step 1: Language Analysis
- What strings should this automaton accept?
- What strings should it reject?
- Identify the key pattern or property.

### Step 2: State Design
- How many states are needed and why?
- What does each state "remember" about the input so far?
- Label states q0, q1, q2, ... with their meaning.

### Step 3: Transition Design
- From each state, for EACH symbol in the alphabet, what is the next state?
- For DFA: EVERY state MUST have exactly ONE transition for EVERY alphabet symbol.
- Missing even one transition makes the DFA invalid.

### Step 4: Accept States
- Which states correspond to the language being accepted?
- There can be ONE or MULTIPLE accept states.
- The start state itself can be an accept state if ε (empty string) is in the language.

### Step 5: Verification
- Check: does every state have a transition for every alphabet symbol?
- Check: are all accept states in the states list?
- Check: is the start state a single state (not a list)?
- Check: is every state reachable from the start state?
- Check: trace a few example strings to verify correct acceptance/rejection.

## SOLVED EXAMPLE: "DFA that accepts strings ending with 01 over {0,1}"

Step 1: Language Analysis
- Accept: strings ending with "01" (e.g., "01", "101", "00101")
- Reject: strings not ending with "01" (e.g., "", "0", "1", "10", "00", "11")
- Key pattern: we need to track the last two symbols seen.

Step 2: State Design
- q0: no suffix match (or just started / last seen "0" but need to track more)
- q1: last symbol seen was "0" (partial match, expecting "1")
- q2: suffix is "01" (accepting state, full match)
Wait — let me redesign more carefully:
- q0: haven't seen any useful suffix / last seen "1" (reset)
- q1: last seen "0" (waiting for "1" to complete "01")
- q2: just completed "01" (accept)

Step 3: Transitions
From q0 (reset / last was 1):
- on 0 → q1 (now last seen 0)
- on 1 → q0 (still reset)
From q1 (last seen 0):
- on 0 → q1 (still last seen 0)
- on 1 → q2 (completed "01")
From q2 (just completed "01"):
- on 0 → q1 (last seen 0)
- on 1 → q0 (last seen 1)

Step 4: Accept States
- Only q2 is accept (last two symbols were "01")

Step 5: Verification
- q0 has transitions on 0→q1, 1→q0 ✓
- q1 has transitions on 0→q1, 1→q2 ✓
- q2 has transitions on 0→q1, 1→q0 ✓
- All states reachable ✓
- Test "01": q0→0→q1→1→q2 ACCEPT ✓
- Test "101": q0→1→q0→0→q1→1→q2 ACCEPT ✓
- Test "10": q0→1→q0→0→q1 REJECT ✓
- Test "": q0 REJECT ✓

## SOLVED EXAMPLE: "DFA that accepts strings where the number of 0s is even"

Step 1: Language Analysis
- Accept: strings with even count of 0s (e.g., "", "1", "00", "11", "001", "010", "1100")
- Reject: strings with odd count of 0s (e.g., "0", "01", "10", "000")
- Key: we only need to track parity of 0s (even vs odd).

Step 2: State Design
- q0: even number of 0s seen (accept)
- q1: odd number of 0s seen

Step 3: Transitions
From q0 (even):
- on 0 → q1 (odd)
- on 1 → q0 (still even)
From q1 (odd):
- on 0 → q0 (even)
- on 1 → q1 (still odd)

Step 4: Accept States
- q0 is accept (even 0s — including empty string "")

Step 5: Verification
- q0: 0→q1, 1→q0 ✓
- q1: 0→q0, 1→q1 ✓
- Test "": q0 ACCEPT ✓
- Test "00": q0→0→q1→0→q0 ACCEPT ✓
- Test "0": q0→0→q1 REJECT ✓

## OUTPUT FORMAT

Put the JSON inside \`\`\`json ... \`\`\` markers.

For DFA:
\`\`\`json
{
  "explanation": "Step 1: Language Analysis...\\nStep 2: State Design...\\nStep 3: Transitions...\\nStep 4: Accept States...\\nStep 5: Verification...",
  "data": {
    "states": "q0,q1,q2",
    "alphabet": "0,1",
    "startState": "q0",
    "acceptStates": "q2",
    "transitions": "q0,0,q1\\nq0,1,q0\\nq1,0,q1\\nq1,1,q2\\nq2,0,q1\\nq2,1,q0"
  }
}
\`\`\`

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

## CRITICAL RULES
- DFA: EVERY state must have exactly ONE transition for EVERY alphabet symbol. This is non-negotiable.
- Accept states: can be ONE or MULTIPLE states. List ALL of them.
- Start state: is a SINGLE state name, never a comma-separated list.
- Transition string: use \\n between lines. Each line format depends on type.
- The "states" field is comma-separated state names.
- Every state in transitions must be in the states list.
- Every accept state must be in the states list.

Requested type: ${type}`;
  }

  private static processAIResult(result: any, type: string): AnyResult {
    const d = result.data;
    if (type === 'DFA') return this.createDFA(d.states, d.alphabet, d.startState, d.acceptStates, d.transitions, result.explanation);
    if (type === 'NFA') return this.createNFA(d.states, d.alphabet, d.startState, d.acceptStates, d.transitions, result.explanation);
    if (type === 'PDA') return this.createPDA(d.states, d.inputAlphabet, d.stackAlphabet, d.startState, d.startStackSymbol, d.acceptStates, d.transitions, result.explanation);
    if (type === 'TM') return this.createTM(d.states, d.inputAlphabet, d.tapeAlphabet, d.startState, d.acceptState, d.rejectState, d.transitions, result.explanation);
    throw new Error(`Unsupported type: ${type}`);
  }

  private static async generateFromLocalPrompt(question: string, type: string): Promise<AnyResult> {
    const q = question.toLowerCase().trim();
    await new Promise(resolve => setTimeout(resolve, 500));
    const note = "\n\n(Note: Generated using local matching engine)";

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

    throw new Error(`No matching pattern found for "${question}". Try 'even 0s', 'contains 101', etc.`);
  }

  private static createDFA(states: string, alphabet: string, start: string, accept: string, transitions: string, explanation: string): DFAIResult {
    return { valid: true, type: 'DFA', explanation, data: { states: AutomataCore.parseCommaSeparated(states), alphabet: AutomataCore.parseCommaSeparated(alphabet), startState: start, acceptStates: AutomataCore.parseCommaSeparated(accept), transitions: AutomataCore.parseTransitions(transitions) } };
  }

  private static createNFA(states: string, alphabet: string, start: string, accept: string, transitions: string, explanation: string): NFAIResult {
    return { valid: true, type: 'NFA', explanation, data: { states: AutomataCore.parseCommaSeparated(states), alphabet: AutomataCore.parseCommaSeparated(alphabet), startState: start, acceptStates: AutomataCore.parseCommaSeparated(accept), transitions: AutomataCore.parseTransitions(transitions) } };
  }

  private static createPDA(states: string, inputAlpha: string, stackAlpha: string, start: string, startStack: string, accept: string, transitions: string, explanation: string): PDAIResult {
    return { valid: true, type: 'PDA', explanation, data: { states: AutomataCore.parseCommaSeparated(states), inputAlphabet: AutomataCore.parseCommaSeparated(inputAlpha), stackAlphabet: AutomataCore.parseCommaSeparated(stackAlpha), startState: start, startStackSymbol: startStack, acceptStates: AutomataCore.parseCommaSeparated(accept), transitions: AutomataCore.parsePDATransitions(transitions) } };
  }

  private static createTM(states: string, inputAlpha: string, tapeAlpha: string, start: string, accept: string, reject: string, transitions: string, explanation: string): TMIResult {
    return { valid: true, type: 'TM', explanation, data: { states: AutomataCore.parseCommaSeparated(states), inputAlphabet: AutomataCore.parseCommaSeparated(inputAlpha), tapeAlphabet: AutomataCore.parseCommaSeparated(tapeAlpha), startState: start, acceptState: accept, rejectState: reject, transitions: AutomataCore.parseTMTransitions(transitions) } };
  }
}
