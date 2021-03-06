import { GraphStyle } from './graph-style';
import { SuperState } from './super-state';
import { State } from './state';

function htmlEntities(unsafe: string) {
  return unsafe.replace(/[<>&'"\$\{\}\r\n]/g, function (c): string {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '{': return '\\{';
      case '}': return '\\}';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '$': return '\\$';
      case '"': return '&quot;';
    }
    return c;
  });
}

/**
 * Generate DOT graphs in basic UML style
 * 
 * @export
 * @class UmlDotGraphStyle
 * @extends {GraphStyle}
 * @template TState 
 */
export class UmlDotGraphStyle<TState> extends GraphStyle<TState> {

  /**
   * Creates an instance of UmlDotGraphStyle.
   * @param {boolean} _isVisibleCurrentState 
   * @memberof UmlDotGraphStyle
   */
  constructor(private readonly _isVisibleCurrentState: boolean) {
    super();
  }

  /// <summary>Get the text that starts a new graph</summary>
  /// <returns></returns>
  public getPrefix(): string {
    return 'digraph {\n'
      + 'compound=true;\n'
      + 'node [shape=Mrecord]\n'
      + 'rankdir="LR"\n';
  }

  /**
   * Generate one cluster.
   * 
   * @param {SuperState<TState>} stateInfo 
   * @returns 
   * @memberof UmlDotGraphStyle
   */
  public formatOneCluster(stateInfo: SuperState<TState>) {

    let stateRepresentationString = '';

    let label = stateInfo.stateName;

    if ((stateInfo.entryActions.length > 0) || (stateInfo.exitActions.length > 0)) {
      label += '\\n----------';
      label += stateInfo.entryActions.map(act => '\\nentry / ' + htmlEntities(act)).join('');
      label += stateInfo.exitActions.map(act => '\\nexit / ' + htmlEntities(act)).join('');
    }

    stateRepresentationString = '\n'
      + `subgraph cluster${stateInfo.nodeName}` + '\n'
      + '\t{' + '\n'
      + `\tlabel = \"${label}\"` + '\n';

    for (const subState of stateInfo.subStates) {
      stateRepresentationString += this.formatOneState(subState);
    }

    stateRepresentationString += '}\n';

    return stateRepresentationString;
  }

  /**Generate the text for a single state
   * 
   * 
   * @param {State<TState>} state The state to generate text for
   * @returns {string} 
   * @memberof UmlDotGraphStyle
   */
  public formatOneState(state: State<TState>): string {

    if ((state.entryActions.length === 0) && (state.exitActions.length === 0)) {
      return `"${state.stateName}"` + ` [${this._isVisibleCurrentState && state.isActive ? 'style="bold, filled", ' : ''}label="` + state.stateName + '"];\n';
    }

    let f = `"${state.stateName}"` + ` [${this._isVisibleCurrentState && state.isActive ? 'style="bold, filled", ' : ''}label="` + state.stateName + '|';

    let es: string[] = [];
    es = es.concat(state.entryActions.map(act => 'entry / ' + htmlEntities(act)));
    es = es.concat(state.exitActions.map(act => 'exit / ' + htmlEntities(act)));

    f += es.join('\\n');

    f += '"];\n';

    return f;
  }

  /**
   * Generate text for a single transition
   * 
   * @param {string} sourceNodeName 
   * @param {string} trigger 
   * @param {Iterable<string>} actions 
   * @param {string} destinationNodeName 
   * @param {Iterable<string>} guards 
   * @returns {string} 
   * @memberof UmlDotGraphStyle
   */
  public formatOneTransition(sourceNodeName: string, trigger: string, actions: Iterable<string> | null, destinationNodeName: string, guards: Iterable<string>): string {
    let label = trigger || '';

    const tempActions = [...(actions || [])];
    if (tempActions.length > 0) {
      label += ' / ' + tempActions.join(', ');
    }

    for (const info of guards) {
      if (label.length > 0) {
        label += ' ';
      }
      label += '[' + info + ']';
    }
    return this.formatOneLine(sourceNodeName, destinationNodeName, label);
  }

  /**
   * Generate the text for a single decision node
   * 
   * @param {string} nodeName Name of the node
   * @param {string} label Label for the node
   * @returns {string} 
   * @memberof UmlDotGraphStyle
   */
  public formatOneDecisionNode(nodeName: string, label: string): string {
    return nodeName + ' [shape = "diamond", label = "' + htmlEntities(label) + '"];\n';
  }

  public formatOneLine(fromNodeName: string, toNodeName: string, label: string) {
    return `"${fromNodeName}"` + ' -> ' + `"${toNodeName}"` + ' ' + '[style="solid", label="' + htmlEntities(label) + '"];';
  }
}
