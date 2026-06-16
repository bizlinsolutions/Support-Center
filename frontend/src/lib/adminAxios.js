import axios from 'axios';
import { setupAdminAxiosInterceptors } from './adminAxiosInterceptors';

const adminApi = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000,
});

setupAdminAxiosInterceptors(adminApi);

export default adminApi;
