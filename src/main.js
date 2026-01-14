import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// ElementPlus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import './styles/index.scss';
import './styles/tailwind.css';

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
