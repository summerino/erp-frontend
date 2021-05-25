import axios from '../axios'

export default {
  login(username, password) {
    return axios.post('/auth/login', {
      username,
      password
    })
  },

  logout() {
    return axios.post('/auth/logout')
  },

  isAuthenticated() {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      return true
    } else {
      //return false
      return true
    }
  }
}
