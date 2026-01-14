export default [
	{
		path: '/github-star',
		name: 'GithubStar',
		component: () => import('@/views/github/GithubStarView.vue'),
	},
	{
		path: '/github-folder-download',
		name: 'GithubFolderDownload',
		component: () => import('@/views/github/GithubFolderDownloadView.vue'),
	},
];
