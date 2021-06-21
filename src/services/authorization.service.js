import api from '@/services/axios.service'

class AuthorizationService {
  getAction(endpoint, menuId, actions) {
    const action = []
    for (let i = 0; i < actions.length; i++) {
      action.push(actions[i])
    }
    
    return api.getAll(`${endpoint.systemManagement.role}/get-action`, {
      params: {
        menuId: menuId,
        actions: JSON.stringify(action)
      }
    })
  }

}
export default new AuthorizationService