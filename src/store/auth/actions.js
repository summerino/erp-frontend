import auth from '@/auth/authService'
import router from '@/router'

const login = ({ commit }, payload) => {
  return new Promise((resolve, reject) => {
    auth.login(payload.username, payload.password)
      .then(response => {
        // If there's user data in response
        if (response.data.userData) {
          // Navigate to homepage
          router.push(router.currentRoute.query.to || '/')

          // Set accessToken
          localStorage.setItem('accessToken', response.data.accessToken)

          // Set user info
          commit('SET_USER_INFO', response.data.userData)

          // Set bearer token in axios
          commit('SET_BEARER', response.data.accessToken)

          resolve(response)
        } else {
          reject({ message: 'The username / password combination is invalid.' })
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
