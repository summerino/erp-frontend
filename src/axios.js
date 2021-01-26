import axios from 'axios'

// Set config defaults when creating the instance
export default axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json' 
  }
})
