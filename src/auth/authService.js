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
    return true
  }
}
