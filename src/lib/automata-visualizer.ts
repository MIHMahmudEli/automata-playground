import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';

export class AutomataVisualizer {
  private container: HTMLElement;
  cy: Core | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  renderAutomaton(data: {
    states: string[]; alphabet: string[]; startState: string; acceptStates: string[];
    transitions: Array<{ from: string; symbol: string; to: string }>;
    reachableStates?: string[]; productiveStates?: string[];
  }, type: string = 'DFA') {
    const elements: ElementDefinition[] = [];

    for (const state of data.states) {
      const isStart = state === data.startState;
      const isAccept = data.acceptStates.includes(state);
      const isReachable = !data.reachableStates || data.reachableStates.includes(state);
      const isProductive = !data.productiveStates || data.productiveStates.includes(state);

      elements.push({
        group: 'nodes',
        data: { id: state, label: state, isStart, isAccept, isReachable, isProductive, type: 'state' },
        classes: [isStart ? 'start-state' : '', isAccept ? 'accept-state' : '', !isReachable ? 'unreachable-state' : '', !isProductive ? 'dead-state' : ''].filter(c => c).join(' ')
      });
    }

    elements.push({ group: 'nodes', data: { id: '__start__', label: '', type: 'start-marker' }, classes: 'start-marker' });
    elements.push({ group: 'edges', data: { id: `__start__-${data.startState}`, source: '__start__', target: data.startState, label: '' }, classes: 'start-edge' });

    const transitionGroups = new Map<string, string[]>();
    for (const trans of data.transitions) {
      const key = `${trans.from}-${trans.to}`;
      if (!transitionGroups.has(key)) transitionGroups.set(key, []);
      transitionGroups.get(key)!.push(trans.symbol);
    }

    for (const [key, symbols] of transitionGroups) {
      const [source, target] = key.split('-');
      elements.push({
        group: 'edges',
        data: { id: `edge-${key}`, source, target, label: symbols.join(', '), isSelfLoop: source === target },
        classes: source === target ? 'self-loop' : ''
      });
    }

    this.renderGraph(elements, type);
  }

  private tokenizeCFGProduction(production: string, variables: string[], terminals: string[]): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < production.length) {
      if (production[i] === ' ') { i++; continue; }
      let matched = false;
      const sortedVars = [...variables].sort((a, b) => b.length - a.length);
      const sortedTerms = [...terminals].sort((a, b) => b.length - a.length);
      for (const v of sortedVars) {
        if (production.startsWith(v, i)) {
          tokens.push(v);
          i += v.length;
          matched = true;
          break;
        }
      }
      if (matched) continue;
      for (const t of sortedTerms) {
        if (production.startsWith(t, i)) {
          tokens.push(t);
          i += t.length;
          matched = true;
          break;
        }
      }
      if (matched) continue;
      tokens.push(production[i]);
      i++;
    }
    return tokens;
  }

  renderCFG(data: {
    variables: string[]; terminals: string[]; startSymbol: string;
    productions: Array<{ variable: string; production: string }>;
    productiveVariables?: string[];
  }) {
    const elements: ElementDefinition[] = [];

    for (const variable of data.variables) {
      const isStart = variable === data.startSymbol;
      const isProductive = !data.productiveVariables || data.productiveVariables.includes(variable);
      elements.push({
        group: 'nodes',
        data: { id: variable, label: variable, isStart, isProductive, type: 'variable' },
        classes: ['cfg-variable', isStart ? 'start-variable' : '', !isProductive ? 'useless-variable' : ''].filter(c => c).join(' ')
      });
    }

    for (const terminal of data.terminals) {
      elements.push({
        group: 'nodes',
        data: { id: `term_${terminal}`, label: terminal, type: 'terminal' },
        classes: 'cfg-terminal'
      });
    }

    let edgeId = 0;
    for (const prod of data.productions) {
      const symbols = this.tokenizeCFGProduction(prod.production, data.variables, data.terminals);
      for (const symbol of symbols) {
        if (symbol === 'ε') continue;
        const targetId = data.variables.includes(symbol) ? symbol : `term_${symbol}`;
        elements.push({
          group: 'edges',
          data: { id: `prod-${edgeId++}`, source: prod.variable, target: targetId, label: prod.production },
          classes: 'production-edge'
        });
      }
    }

    this.renderGraph(elements, 'CFG');
  }

  renderPDA(data: {
    states: string[]; startState: string; acceptStates: string[];
    transitions: Array<{ from: string; input: string; stackTop: string; to: string; stackPush: string }>;
  }) {
    const elements: ElementDefinition[] = [];

    for (const state of data.states) {
      const isStart = state === data.startState;
      const isAccept = data.acceptStates.includes(state);
      elements.push({
        group: 'nodes',
        data: { id: state, label: state, isStart, isAccept, type: 'state' },
        classes: [isStart ? 'start-state' : '', isAccept ? 'accept-state' : ''].filter(c => c).join(' ')
      });
    }

    elements.push({ group: 'nodes', data: { id: '__start__', label: '', type: 'start-marker' }, classes: 'start-marker' });
    elements.push({ group: 'edges', data: { id: `__start__-${data.startState}`, source: '__start__', target: data.startState, label: '' }, classes: 'start-edge' });

    for (let i = 0; i < data.transitions.length; i++) {
      const trans = data.transitions[i];
      elements.push({
        group: 'edges',
        data: { id: `pda-edge-${i}`, source: trans.from, target: trans.to, label: `${trans.input}, ${trans.stackTop} → ${trans.stackPush}` },
        classes: trans.from === trans.to ? 'self-loop' : ''
      });
    }

    this.renderGraph(elements, 'PDA');
  }

  renderTM(data: {
    states: string[]; startState: string; acceptState?: string; rejectState?: string;
    transitions: Array<{ from: string; read: string; to: string; write: string; direction: string }>;
  }) {
    const elements: ElementDefinition[] = [];

    for (const state of data.states) {
      const isStart = state === data.startState;
      const isAccept = state === data.acceptState;
      const isReject = state === data.rejectState;
      elements.push({
        group: 'nodes',
        data: { id: state, label: state, isStart, isAccept, isReject, type: 'state' },
        classes: [isStart ? 'start-state' : '', isAccept ? 'accept-state' : '', isReject ? 'dead-state' : ''].filter(c => c).join(' ')
      });
    }

    elements.push({ group: 'nodes', data: { id: '__start__', label: '', type: 'start-marker' }, classes: 'start-marker' });
    elements.push({ group: 'edges', data: { id: `__start__-${data.startState}`, source: '__start__', target: data.startState, label: '' }, classes: 'start-edge' });

    for (let i = 0; i < data.transitions.length; i++) {
      const trans = data.transitions[i];
      elements.push({
        group: 'edges',
        data: { id: `tm-edge-${i}`, source: trans.from, target: trans.to, label: `${trans.read} → ${trans.write}, ${trans.direction}` },
        classes: trans.from === trans.to ? 'self-loop' : ''
      });
    }

    this.renderGraph(elements, 'TM');
  }

  private renderGraph(elements: ElementDefinition[], type: string) {
    if (this.cy) { this.cy.destroy(); }

    this.cy = cytoscape({
      container: this.container,
      elements,
      style: [
        { selector: 'node[type="state"]', style: { 'background-color': '#4a5568', 'border-width': 3, 'border-color': '#8b5cf6', 'label': 'data(label)', 'color': '#ffffff', 'text-valign': 'center', 'text-halign': 'center', 'font-size': '16px', 'font-weight': 'bold', 'width': 60, 'height': 60, 'font-family': 'Inter, sans-serif' } },
        { selector: '.start-state', style: { 'border-color': '#10b981', 'border-width': 4 } },
        { selector: '.accept-state', style: { 'border-width': 6, 'border-color': '#ec4899' } },
        { selector: '.unreachable-state', style: { 'background-color': '#374151', 'opacity': 0.5 } },
        { selector: '.dead-state', style: { 'background-color': '#7f1d1d', 'border-color': '#ef4444' } },
        { selector: '.start-marker', style: { 'width': 1, 'height': 1, 'background-color': 'transparent', 'border-width': 0 } },
        { selector: '.cfg-variable', style: { 'shape': 'rectangle', 'background-color': '#5b21b6', 'width': 70, 'height': 50, 'label': 'data(label)', 'color': '#ffffff', 'text-valign': 'center', 'text-halign': 'center', 'font-size': '14px', 'font-weight': 'bold' } },
        { selector: '.start-variable', style: { 'border-color': '#10b981', 'border-width': 4 } },
        { selector: '.cfg-terminal', style: { 'shape': 'ellipse', 'background-color': '#1e40af', 'width': 50, 'height': 50, 'label': 'data(label)', 'color': '#ffffff', 'text-valign': 'center', 'text-halign': 'center', 'font-size': '12px' } },
        { selector: '.useless-variable', style: { 'background-color': '#7f1d1d', 'opacity': 0.6 } },
        { selector: 'edge', style: { 'width': 2, 'line-color': '#8b5cf6', 'target-arrow-color': '#8b5cf6', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'label': 'data(label)', 'font-size': '14px', 'color': '#e0e0e0', 'text-background-color': '#1a1d3a', 'text-background-opacity': 0.8, 'text-background-padding': '3px', 'font-family': 'JetBrains Mono, monospace', 'text-rotation': 'autorotate' } },
        { selector: '.self-loop', style: { 'loop-direction': '-45deg', 'loop-sweep': '90deg', 'control-point-step-size': 80 } },
        { selector: '.start-edge', style: { 'line-color': '#10b981', 'target-arrow-color': '#10b981', 'width': 3 } },
        { selector: '.production-edge', style: { 'line-color': '#a78bfa', 'target-arrow-color': '#a78bfa' } },
        { selector: ':selected', style: { 'background-color': '#ec4899', 'line-color': '#ec4899', 'target-arrow-color': '#ec4899', 'border-color': '#ec4899' } }
      ],
      layout: this.getLayout(type),
      wheelSensitivity: 1,
      minZoom: 0.3,
      maxZoom: 3
    });

    this.addInteractivity();
  }

  private getLayout(type: string) {
    if (type === 'CFG') {
      return { name: 'breadthfirst' as const, directed: true, spacingFactor: 1.5, avoidOverlap: true, nodeDimensionsIncludeLabels: true };
    }
    return { name: 'cose' as const, animate: true, animationDuration: 500, nodeDimensionsIncludeLabels: true, nodeRepulsion: 8000, idealEdgeLength: 100, edgeElasticity: 100, nestingFactor: 1.2, gravity: 1, numIter: 1000, initialTemp: 200, coolingFactor: 0.95, minTemp: 1.0 };
  }

  private addInteractivity() {
    if (!this.cy) return;

    this.cy.on('mouseover', 'node', (evt) => {
      if (evt.target.data('type') === 'start-marker') return;
      evt.target.style('background-color', '#7c3aed');
    });

    this.cy.on('mouseout', 'node', (evt) => {
      if (evt.target.data('type') === 'start-marker') return;
      const node = evt.target;
      if (node.hasClass('cfg-variable')) node.style('background-color', '#5b21b6');
      else if (node.hasClass('cfg-terminal')) node.style('background-color', '#1e40af');
      else node.style('background-color', '#4a5568');
    });

    this.cy.on('dblclick', 'node', (evt) => {
      const node = evt.target;
      if (node.data('type') === 'start-marker') return;
      const connectedEdges = node.connectedEdges();
      const connectedNodes = connectedEdges.connectedNodes();
      this.cy?.elements().removeClass('highlighted dimmed');
      node.addClass('highlighted');
      connectedNodes.addClass('highlighted');
      connectedEdges.addClass('highlighted');
      this.cy?.elements().not('.highlighted').addClass('dimmed');
    });

    this.cy.on('click', (evt) => {
      if (evt.target === this.cy) this.cy?.elements().removeClass('highlighted dimmed');
    });
  }

  exportPNG(): Blob | undefined {
    if (!this.cy) return;
    return this.cy.png({ output: 'blob', bg: '#1a1d3a', full: true, scale: 2 });
  }

  resetView() {
    this.cy?.fit();
    this.cy?.center();
  }

  highlightState(stateId: string, color = '#10b981') {
    this.cy?.getElementById(stateId).style('background-color', color);
  }

  resetHighlights() {
    this.cy?.nodes('[type="state"]').style('background-color', '#4a5568');
  }

  destroy() {
    this.cy?.destroy();
    this.cy = null;
  }
}
