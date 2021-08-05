export default {
  setAction: (state, actions) => {
    state.actions = actions
  },
  setAuth: (state, actions) => {
    for (const action of actions)  {
      const stateAction = state.actions.find(x => x.id === action)
      if (stateAction) {
        state.authorization[`allow${stateAction.initial}`] = true
      }
    }
    // state.authorization.allowCreate = actions.some(x => x === state.action.create)
    // state.authorization.allowUpdate = actions.some(x => x === state.action.update)
    // state.authorization.allowDelete = actions.some(x => x === state.action.delete)
    // state.authorization.allowVoid = actions.some(x => x === state.action.void)
    // state.authorization.allowChangeWarehouse = actions.some(x => x === state.action.changeWarehouse) 
    // state.authorization.allowChangeDate = actions.some(x => x === state.action.changeDate) 
    // state.authorization.allowApproveTransferStock = actions.some(x => x === state.action.approveTransferStock) 
    // state.authorization.allowPost = actions.some(x => x === state.action.post)
    // state.authorization.allowApproveConsignee = actions.some(x => x === state.action.approveConsignee) 
    // state.authorization.allowApproveAdjustment = actions.some(x => x === state.action.approveAdjustment) 
    // state.authorization.allowApprovePurcOrd = actions.some(x => x === state.action.approvePurcOrd) 
    // state.authorization.allowApprovePurcRcv = actions.some(x => x === state.action.approvePurcRcv) 
    // state.authorization.allowApprovePurcInv = actions.some(x => x === state.action.approvePurcInv) 
    // state.authorization.allowApprovePurcRtn = actions.some(x => x === state.action.approvePurcRtn) 
    // state.authorization.allowApprovePromo = actions.some(x => x === state.action.approvePromo) 
    // state.authorization.allowApproveSlsOrd = actions.some(x => x === state.action.approveSlsOrd) 
    // state.authorization.allowApproveDlvOrd = actions.some(x => x === state.action.approveDlvOrd) 
    // state.authorization.allowApproveSlsInv = actions.some(x => x === state.action.approveSlsInv) 
    // state.authorization.allowApproveSlsRtn = actions.some(x => x === state.action.approveSlsRtn) 
    // state.authorization.allowApproveDlvPlan = actions.some(x => x === state.action.approveDlvPlan) 
    // state.authorization.allowApproveVisitOrd = actions.some(x => x === state.action.approveVisitOrd) 
    // state.authorization.allowApproveExpInv = actions.some(x => x === state.action.approveExpInv) 
    // state.authorization.allowApproveGeneralCB = actions.some(x => x === state.action.approveGeneralCB) 
    // state.authorization.allowApproveInterCB = actions.some(x => x === state.action.approveInterCB) 
    // state.authorization.allowApproveGeneralJournal = actions.some(x => x === state.action.approveGeneralJournal) 
    // state.authorization.allowApproveFixedAsset = actions.some(x => x === state.action.approveFixedAsset) 
    // state.authorization.allowCbTypeAR = actions.some(x => x === state.action.cbTypeAR)
    // state.authorization.allowCbTypeAP = actions.some(x => x === state.action.cbTypeAP)
    // state.authorization.allowCbTypeEPAP = actions.some(x => x === state.action.cbTypeEPAP)
    // state.authorization.allowCbTypeTU = actions.some(x => x === state.action.cbTypeTU)
    // state.authorization.allowCbTypeDPC = actions.some(x => x === state.action.cbTypeDPC)
    // state.authorization.allowCbTypeRDPC = actions.some(x => x === state.action.cbTypeRDPC)
    // state.authorization.allowCbTypeDPS = actions.some(x => x === state.action.cbTypeDPS)
    // state.authorization.allowCbTypeRDPS = actions.some(x => x === state.action.cbTypeRDPS)
    // state.authorization.allowCbTypeSR = actions.some(x => x === state.action.cbTypeSR)
    // state.authorization.allowCbTypePR = actions.some(x => x === state.action.cbTypePR)
    // state.authorization.allowPrint = actions.some(x => x === state.action.print)
  }
}