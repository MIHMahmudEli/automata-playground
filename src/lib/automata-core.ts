export interface Transition {
  from: string;
  symbol: string;
  to: string;
}

export interface PDATransition {
  from: string;
  input: string;
  stackTop: string;
  to: string;
  stackPush: string;
}

export interface TMTransition {
  from: string;
  read: string;
  to: string;
  write: string;
  direction: string;
}

export interface Production {
  variable: string;
  production: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data: Record<string, unknown>;
}

export class AutomataCore {
  static parseCommaSeparated(str?: string): string[] {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  static parseTransitions(str?: string): Transition[] {
    if (!str) return [];
    return str.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length === 3) {
          return { from: parts[0], symbol: parts[1], to: parts[2] };
        }
        return null;
      })
      .filter((t): t is Transition => t !== null);
  }

  static parseProductions(str?: string): Production[] {
    if (!str) return [];
    return str.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(/->|→/).map(p => p.trim());
        if (parts.length === 2) {
          return { variable: parts[0], production: parts[1] };
        }
        return null;
      })
      .filter((p): p is Production => p !== null);
  }

  static parsePDATransitions(str?: string): PDATransition[] {
    if (!str) return [];
    return str.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length === 5) {
          return { from: parts[0], input: parts[1], stackTop: parts[2], to: parts[3], stackPush: parts[4] };
        }
        return null;
      })
      .filter((t): t is PDATransition => t !== null);
  }

  static parseTMTransitions(str?: string): TMTransition[] {
    if (!str) return [];
    return str.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length === 5) {
          return { from: parts[0], read: parts[1], to: parts[2], write: parts[3], direction: parts[4] };
        }
        return null;
      })
      .filter((t): t is TMTransition => t !== null);
  }

  static findReachableStates(states: string[], startState: string, transitions: Transition[]): Set<string> {
    const reachable = new Set([startState]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const trans of transitions) {
        if (reachable.has(trans.from) && !reachable.has(trans.to)) {
          reachable.add(trans.to);
          changed = true;
        }
      }
    }
    return reachable;
  }

  static findProductiveStates(states: string[], acceptStates: string[], transitions: Transition[]): Set<string> {
    const productive = new Set(acceptStates);
    let changed = true;
    while (changed) {
      changed = false;
      for (const trans of transitions) {
        if (productive.has(trans.to) && !productive.has(trans.from)) {
          productive.add(trans.from);
          changed = true;
        }
      }
    }
    return productive;
  }

  static findProductiveVariables(variables: string[], terminals: string[], productions: Production[]): Set<string> {
    const productive = new Set<string>();
    let changed = true;
    while (changed) {
      changed = false;
      for (const prod of productions) {
        if (productive.has(prod.variable)) continue;
        let canProduce = true;
        for (const symbol of prod.production.split('')) {
          if (symbol === 'ε' || symbol === ' ') continue;
          if (!terminals.includes(symbol) && !productive.has(symbol)) {
            canProduce = false;
            break;
          }
        }
        if (canProduce) {
          productive.add(prod.variable);
          changed = true;
        }
      }
    }
    return productive;
  }

  static validateDFA(input: {
    states?: string; alphabet?: string; startState?: string; acceptStates?: string; transitions?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const states = this.parseCommaSeparated(input.states);
    const alphabet = this.parseCommaSeparated(input.alphabet);
    const startState = input.startState?.trim() || '';
    const acceptStates = this.parseCommaSeparated(input.acceptStates);
    const transitions = this.parseTransitions(input.transitions);

    if (states.length === 0) errors.push("At least one state is required");
    if (alphabet.length === 0) errors.push("At least one alphabet symbol is required");
    if (!startState) errors.push("Start state is required");
    else if (!states.includes(startState)) errors.push(`Start state "${startState}" is not in the set of states`);

    for (const state of acceptStates) {
      if (!states.includes(state)) errors.push(`Accept state "${state}" is not in the set of states`);
    }

    const transitionMap = new Map<string, string>();
    for (const trans of transitions) {
      if (!states.includes(trans.from)) errors.push(`Transition from state "${trans.from}" is invalid`);
      if (!states.includes(trans.to)) errors.push(`Transition to state "${trans.to}" is invalid`);
      if (!alphabet.includes(trans.symbol)) errors.push(`Transition symbol "${trans.symbol}" is not in the alphabet`);

      const key = `${trans.from},${trans.symbol}`;
      if (transitionMap.has(key)) {
        errors.push(`Non-deterministic transition: state "${trans.from}" has multiple transitions on symbol "${trans.symbol}"`);
      }
      transitionMap.set(key, trans.to);
    }

    for (const state of states) {
      for (const symbol of alphabet) {
        const key = `${state},${symbol}`;
        if (!transitionMap.has(key)) {
          warnings.push(`Missing transition: state "${state}" on symbol "${symbol}"`);
        }
      }
    }

    const reachable = this.findReachableStates(states, startState, transitions);
    const unreachable = states.filter(s => !reachable.has(s));
    if (unreachable.length > 0) warnings.push(`Unreachable states: ${unreachable.join(', ')}`);

    const productive = this.findProductiveStates(states, acceptStates, transitions);
    const dead = states.filter(s => !productive.has(s));
    if (dead.length > 0 && dead.length < states.length) warnings.push(`Dead states: ${dead.join(', ')}`);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: {
        states, alphabet, startState, acceptStates, transitions,
        reachableStates: Array.from(reachable),
        productiveStates: Array.from(productive)
      }
    };
  }

  static validateNFA(input: {
    states?: string; alphabet?: string; startState?: string; acceptStates?: string; transitions?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const states = this.parseCommaSeparated(input.states);
    const alphabet = this.parseCommaSeparated(input.alphabet);
    const startState = input.startState?.trim() || '';
    const acceptStates = this.parseCommaSeparated(input.acceptStates);
    const transitions = this.parseTransitions(input.transitions);

    if (states.length === 0) errors.push("At least one state is required");
    if (alphabet.length === 0) errors.push("At least one alphabet symbol is required");
    if (!startState) errors.push("Start state is required");
    else if (!states.includes(startState)) errors.push(`Start state "${startState}" is not in the set of states`);

    for (const state of acceptStates) {
      if (!states.includes(state)) errors.push(`Accept state "${state}" is not in the set of states`);
    }

    for (const trans of transitions) {
      if (!states.includes(trans.from)) errors.push(`Transition from state "${trans.from}" is invalid`);
      if (!states.includes(trans.to)) errors.push(`Transition to state "${trans.to}" is invalid`);
      if (trans.symbol !== 'ε' && !alphabet.includes(trans.symbol)) {
        errors.push(`Transition symbol "${trans.symbol}" is not in the alphabet`);
      }
    }

    const reachable = this.findReachableStates(states, startState, transitions);
    const unreachable = states.filter(s => !reachable.has(s));
    if (unreachable.length > 0) warnings.push(`Unreachable states: ${unreachable.join(', ')}`);

    return {
      valid: errors.length === 0,
      errors, warnings,
      data: { states, alphabet, startState, acceptStates, transitions, reachableStates: Array.from(reachable) }
    };
  }

  static validateCFG(input: {
    variables?: string; terminals?: string; startSymbol?: string; productions?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const variables = this.parseCommaSeparated(input.variables);
    const terminals = this.parseCommaSeparated(input.terminals);
    const startSymbol = input.startSymbol?.trim() || '';
    const productions = this.parseProductions(input.productions);

    if (variables.length === 0) errors.push("At least one variable is required");
    if (terminals.length === 0) errors.push("At least one terminal is required");
    if (!startSymbol) errors.push("Start symbol is required");
    else if (!variables.includes(startSymbol)) errors.push(`Start symbol "${startSymbol}" is not in the set of variables`);

    const overlap = variables.filter(v => terminals.includes(v));
    if (overlap.length > 0) errors.push(`Variables and terminals overlap: ${overlap.join(', ')}`);

    for (const prod of productions) {
      if (!variables.includes(prod.variable)) errors.push(`Production variable "${prod.variable}" is not in the set of variables`);
      for (const symbol of prod.production.split('')) {
        if (symbol !== 'ε' && !variables.includes(symbol) && !terminals.includes(symbol) && symbol !== ' ') {
          warnings.push(`Symbol "${symbol}" in production "${prod.variable} → ${prod.production}" may be invalid`);
        }
      }
    }

    const productive = this.findProductiveVariables(variables, terminals, productions);
    const useless = variables.filter(v => !productive.has(v));
    if (useless.length > 0) warnings.push(`Useless variables: ${useless.join(', ')}`);

    return {
      valid: errors.length === 0,
      errors, warnings,
      data: { variables, terminals, startSymbol, productions, productiveVariables: Array.from(productive) }
    };
  }

  static validatePDA(input: {
    states?: string; inputAlphabet?: string; stackAlphabet?: string;
    startState?: string; startStackSymbol?: string; acceptStates?: string; transitions?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const states = this.parseCommaSeparated(input.states);
    const inputAlphabet = this.parseCommaSeparated(input.inputAlphabet);
    const stackAlphabet = this.parseCommaSeparated(input.stackAlphabet);
    const startState = input.startState?.trim() || '';
    const startStackSymbol = input.startStackSymbol?.trim() || '';
    const acceptStates = this.parseCommaSeparated(input.acceptStates);
    const transitions = this.parsePDATransitions(input.transitions);

    if (states.length === 0) errors.push("At least one state is required");
    if (inputAlphabet.length === 0) errors.push("At least one input symbol is required");
    if (stackAlphabet.length === 0) errors.push("At least one stack symbol is required");
    if (!startState) errors.push("Start state is required");
    if (!startStackSymbol) errors.push("Start stack symbol is required");

    for (const trans of transitions) {
      if (!states.includes(trans.from)) errors.push(`Invalid from state: ${trans.from}`);
      if (!states.includes(trans.to)) errors.push(`Invalid to state: ${trans.to}`);
    }

    return {
      valid: errors.length === 0,
      errors, warnings,
      data: { states, inputAlphabet, stackAlphabet, startState, startStackSymbol, acceptStates, transitions }
    };
  }

  static validateTM(input: {
    states?: string; inputAlphabet?: string; tapeAlphabet?: string;
    startState?: string; acceptState?: string; rejectState?: string; transitions?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const states = this.parseCommaSeparated(input.states);
    const inputAlphabet = this.parseCommaSeparated(input.inputAlphabet);
    const tapeAlphabet = this.parseCommaSeparated(input.tapeAlphabet);
    const startState = input.startState?.trim() || '';
    const acceptState = input.acceptState?.trim() || '';
    const rejectState = input.rejectState?.trim() || '';
    const transitions = this.parseTMTransitions(input.transitions);

    if (states.length === 0) errors.push("At least one state is required");
    if (inputAlphabet.length === 0) errors.push("Input alphabet is required");
    if (tapeAlphabet.length === 0) errors.push("Tape alphabet is required");
    if (!startState) errors.push("Start state is required");
    if (!acceptState) errors.push("Accept state is required");

    for (const sym of inputAlphabet) {
      if (!tapeAlphabet.includes(sym)) warnings.push(`Input symbol "${sym}" is not in the tape alphabet`);
    }

    for (const trans of transitions) {
      if (!states.includes(trans.from)) errors.push(`Invalid from state: ${trans.from}`);
      if (!states.includes(trans.to)) errors.push(`Invalid to state: ${trans.to}`);
      if (trans.read !== 'B' && !tapeAlphabet.includes(trans.read)) errors.push(`Invalid read symbol: ${trans.read}`);
      if (trans.write !== 'B' && !tapeAlphabet.includes(trans.write)) errors.push(`Invalid write symbol: ${trans.write}`);
      if (!['L', 'R', 'S'].includes(trans.direction)) errors.push(`Invalid direction: ${trans.direction} (must be L, R, or S)`);
    }

    return {
      valid: errors.length === 0,
      errors, warnings,
      data: { states, inputAlphabet, tapeAlphabet, startState, acceptState, rejectState, transitions }
    };
  }

  static simulateDFA(dfa: {
    startState: string; acceptStates: string[]; transitionMap?: Map<string, string>;
    transitions: Transition[]; states: string[]; alphabet: string[];
  }, inputString: string) {
    const steps: Array<{
      step: number; state: string; remaining: string; consumed: string;
      symbol?: string; error?: string; accepted: boolean;
    }> = [];
    let currentState = dfa.startState;

    if (!dfa.transitionMap) {
      const map = new Map<string, string>();
      for (const t of dfa.transitions) {
        map.set(`${t.from},${t.symbol}`, t.to);
      }
      dfa.transitionMap = map;
    }

    steps.push({ step: 0, state: currentState, remaining: inputString, consumed: '', accepted: dfa.acceptStates.includes(currentState) });

    for (let i = 0; i < inputString.length; i++) {
      const symbol = inputString[i];
      const key = `${currentState},${symbol}`;

      if (!dfa.transitionMap.has(key)) {
        steps.push({ step: i + 1, state: 'ERROR', remaining: inputString.slice(i), consumed: inputString.slice(0, i), error: `No transition from "${currentState}" on "${symbol}"`, accepted: false });
        return { steps, accepted: false };
      }

      currentState = dfa.transitionMap.get(key)!;
      steps.push({ step: i + 1, state: currentState, remaining: inputString.slice(i + 1), consumed: inputString.slice(0, i + 1), symbol, accepted: dfa.acceptStates.includes(currentState) });
    }

    return { steps, accepted: dfa.acceptStates.includes(currentState) };
  }
}
