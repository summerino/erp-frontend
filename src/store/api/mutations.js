export default {
  setAction: (state, actions) => {
    state.action = actions
  },
  setAuth: (state, actions) => {
    for (const action of actions)  {
      const stateAction = state.action.find(x => x.id === action)
      if (stateAction) {
        state.authorization[`allow${stateAction.initial}`] = true
      }
    }
  }
}