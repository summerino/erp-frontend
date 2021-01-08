import axios from '@/axios'

export default {
  SET_USER_INFO(payload) {
    // Store data in localStorage
    localStorage.setItem('userInfo', JSON.stringify(payload))
  },

  SET_BEARER(state, accessToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }
}
