import axios from 'axios'
import store from './store'

// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json' 
  }
})

// request interceptor
instance.interceptors.request.use((config) => {
  store.state.app.loadOverlay = true
  return config
}, (error) => {
  store.state.app.loadOverlay = false
  return Promise.reject(error)
})

// response interceptor
instance.interceptors.response.use((response) => {
  store.state.app.loadOverlay = false
  if (!(response?.data?.success ?? true)) {
    store.dispatch('app/showInfo', response.data.message)
  }
  return response
}, (error) => {
  store.state.app.loadOverlay = false
  if (error.response) {
    let errMessage = error.response?.data?.title ?? ''
    if (!errMessage) {
      errMessage = `${error.response.statusText}.`
    }
    store.dispatch('app/showError', `${error.response.status} ${errMessage}`)
  }
  return Promise.reject(error)
})

export default instance
