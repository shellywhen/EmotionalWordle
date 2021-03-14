/* eslint-disable */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@simonwep/pickr/dist/themes/nano.min.css';
import '@/assets/scss/_font.scss';
import '@/assets/scss/bootstrap.min.css';

createApp(App)
  .use(store)
  .use(router)
  .mount('#app')
