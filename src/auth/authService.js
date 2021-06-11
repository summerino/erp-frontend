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
    return new Date(Date.now()) < new Date(localStorage.getItem('expToken') * 1000) &&
      localStorage.getItem('accessToken')
  }
}
