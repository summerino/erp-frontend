import api from '@/services/axios.service'

class AuthorizationService {
  getAction(endpoint, menuId, actions = []) {
    return api.getAll(`${endpoint.systemManagement.role}/get-action`, {
      params: {
        menuId: menuId,
        actions: JSON.stringify(actions)
      }
    })
  }
  getUserInfo() {
    const token = localStorage.getItem('accessToken')
    const userInfo = this.parseJwt(token)
    return userInfo
  }
  parseJwt(token) {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      const temp = (`00${c.charCodeAt(0).toString(16)}`).slice(-2)
      return `%${temp}`
    }).join(''))
    return JSON.parse(jsonPayload)
  }
}
export default new AuthorizationService