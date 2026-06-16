import axios from 'axios'
import { setupAxiosInterceptors } from './axiosInterceptors'

const api = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000,
})

setupAxiosInterceptors(api)

export default api
