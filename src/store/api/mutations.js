export default {
  setAuth: (state, actions) => {
    state.authorization.allowInsert = actions.find(x => x === state.action.insert) !== undefined 
    state.authorization.allowUpdate = actions.find(x => x === state.action.update) !== undefined 
    state.authorization.allowDelete = actions.find(x => x === state.action.delete) !== undefined 
    state.authorization.allowVoid = actions.find(x => x === state.action.void) !== undefined 
    state.authorization.allowChangeWarehouse = actions.find(x => x === state.action.changeWarehouse) !== undefined 
    state.authorization.allowChangeDate = actions.find(x => x === state.action.changeDate) !== undefined 
    state.authorization.allowApprove = actions.find(x => x === state.action.approve) !== undefined 
  }
}