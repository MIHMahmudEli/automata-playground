import { AutomataCore, type Transition, type PDATransition, type TMTransition } from './automata-core';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_KEY || '';
const MAX_RETRIES = 2;

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
        model: 'llama-3.3-70b-versatile',
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
      return this.generateWithGroq(
        `I previously tried "${question}" but the result had these errors:\n${validation.errors.join('\n')}\n\nPlease fix the errors and provide a correct ${type}. Reason step by step before giving the JSON.`,
        type,
        retries - 1
      );
    }

    return result;
  }

  private static getSystemPrompt(type: string) {
    return `You are an expert in Automata Theory. Given a user request for a ${type}, you MUST reason step by step, then output a valid JSON object.

## How to respond

First, think through the problem carefully in the "explanation" field. Then put the final ${type} definition in the "data" field.

### DFA rules (critical):
- Each state MUST have exactly one transition for every symbol in the alphabet. No exceptions.
- The start state cannot be a comma-separated list; it is a single state name.
- Accept states can be multiple, comma-separated in the string format.
- All states must be reachable from the start state.
- Use standard state names like q0, q1, q2, ...

### Output format for DFA:
{
  "explanation": "Step-by-step reasoning: first I understood the language, then determined the minimal states, then designed transitions ensuring each state has one transition per alphabet symbol, then marked accept states.",
  "data": {
    "states": "q0,q1",
    "alphabet": "0,1",
    "startState": "q0",
    "acceptStates": "q0",
    "transitions": "q0,0,q1\\nq0,1,q0\\nq1,0,q1\\nq1,1,q0"
  }
}

### Output format for NFA (supports ε transitions):
{
  "explanation": "Step-by-step reasoning...",
  "data": {
    "states": "q0,q1",
    "alphabet": "0,1",
    "startState": "q0",
    "acceptStates": "q1",
    "transitions": "q0,0,q0\\nq0,0,q1\\nq0,1,q0\\nq1,1,q1"
  }
}

### Output format for PDA:
{
  "explanation": "Step-by-step reasoning...",
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

### Output format for TM:
{
  "explanation": "Step-by-step reasoning...",
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

### Transition format rules:
- DFA/NFA transitions: each line = "from,symbol,to"
- PDA transitions: each line = "from,input,stackTop,to,stackPush"
- TM transitions: each line = "from,read,to,write,direction"
- Use \\n (escaped newline) between transition lines
- Use ε (epsilon) for empty string transitions in NFA and PDA

Requested type: ${type}

IMPORTANT: Wrap the entire JSON in \`\`\`json ... \`\`\` markers.`;
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
