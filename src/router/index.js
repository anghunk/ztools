import { createRouter, createWebHistory  } from 'vue-router';
import githubRoutes from './modules/github';
import fontRoutes from './modules/font';
import devRoutes from './modules/dev';

const routes = [
	{ path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
	...githubRoutes,
	...fontRoutes,
	...devRoutes,
];

export default createRouter({
	history: createWebHistory (),
	routes,
});
