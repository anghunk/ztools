export default [
	{
		path: '/timestamp',
		name: 'Timestamp',
		component: () => import('@/views/dev/TimestampView.vue'),
	},
	{
		path: '/ip',
		name: 'Ip',
		component: () => import('@/views/dev/IpView.vue'),
	},
];
