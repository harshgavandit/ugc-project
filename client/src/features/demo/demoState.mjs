export const initialDemoState = Object.freeze({ view: 'setup', referencesReady: false });

// These transitions only select bundled examples; they perform no generation or persistence.
export function transitionDemo(state, action) {
    if (action === 'reset') return initialDemoState;
    if (action === 'load-references') return { view: 'setup', referencesReady: true };
    if (!state.referencesReady) return state;
    if (action === 'show-output') return { ...state, view: 'saved' };
    if (action === 'show-error') return { ...state, view: 'error' };
    if (action === 'retry' && state.view === 'error') return { ...state, view: 'saved' };
    return state;
}
