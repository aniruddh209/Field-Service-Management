import axios from 'axios'

// Base API configuration for ASP.NET Core backend (will be used later)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api
