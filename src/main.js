import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import store from './store/store.js'

const token = localStorage.getItem('authToken')
if(token) {
    store.commit('setToken', token)
}

const app = createApp(App);

app.use(store);

app.mount('#app')
