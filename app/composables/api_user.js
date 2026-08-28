import axios from 'axios'
import config from './config'
import { useUserStore } from '~/stores/user'

let { userBaseURL } = config

let api = axios.create({ method: 'post', baseURL: userBaseURL })
api.interceptors.request.use((config) => {
    const userStore = useUserStore()
    const savedToken = typeof window !== 'undefined'
        ? localStorage.getItem('token_user')
        : ''
    const token = userStore.token_user || savedToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})
api.interceptors.response.use((config) => {
    return config.data
})
export default {

}
