import { Transition } from './transition';
import { InvocationInfo } from './reflection/invocation-info';

/**
 * Since I implement both sync/async with Promise so we don't need implement Sync/Async for this case.
 * 
 * @export
 * @class UnhandledTriggerAction
 * @template TState 
 * @template TTrigger 
 * @link https://github.com/dotnet-state-machine/stateless/blob/dev/src/Stateless/ExitActionBehavior.cs
 */
export class ExitActionBehaviour<TState, TTrigger> {

  /**
   * Creates an instance of ExitActionBehaviour.
   * @param {(((transition: Transition<TState, TTrigger>) => void | Promise<void>))} _action 
   * @param {InvocationInfo} _description 
   * @memberof ExitActionBehaviour
   */
  constructor(
    private readonly _action: ((transition: Transition<TState, TTrigger>) => void | Promise<void>),
    private readonly _description: InvocationInfo | null) { }

  public async execute(transition: Transition<TState, TTrigger>): Promise<void> {
    const reuslt = this._action(transition);
    if (reuslt instanceof Promise) {
      await reuslt;
    }
  }

  public get description(): InvocationInfo | null { return this._description; }
}