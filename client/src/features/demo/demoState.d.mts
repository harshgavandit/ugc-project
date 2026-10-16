export type DemoState = { view: 'setup' | 'saved' | 'error'; referencesReady: boolean };
export type DemoAction = 'reset' | 'load-references' | 'show-output' | 'show-error' | 'retry';
export const initialDemoState: DemoState;
export function transitionDemo(state: DemoState, action: DemoAction): DemoState;
