import axios from 'axios';

const defaultBaseUrl = import.meta.env.DEV ? 'http://localhost:8080' : '/';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASEURL || defaultBaseUrl,
})

export default api
