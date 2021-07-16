import auth from '@/services/auth.service'
import router from '@/router'

const login = ({ commit }, payload) => {
  return new Promise((resolve, reject) => {
    auth.login(payload.username, payload.password)
      .then(response => {
        // If there's user data in response
        if (response.data.success) {
          // Set accessToken
          localStorage.setItem('accessToken', response.data.accessToken)

          // Set expToken
          localStorage.setItem('expToken', response.data.expToken)

          // Set user info
          commit('SET_USER_INFO', response.data.userData)

          // Set bearer token in axios
          commit('SET_BEARER', response.data.accessToken)

          // Navigate to homepage
          router.push({ path: router.currentRoute.query.to || '/' }).catch(() => {})

          resolve(response)
        } else {
          reject({ message: response.data.message })
        }
      })
      .catch(error => { reject(error) })
  })
}

const logout = () => {
  return new Promise((resolve, reject) => {
    auth.logout()
      .then(response => {
        // Remove localStorage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('expToken')
        localStorage.removeItem('userInfo')

        // Navigate to login page
        router.push({ name: 'login' })

        resolve(response)
      })
      .catch(error => { reject(error) })
  })
}

export default {
  login,
  logout
}
