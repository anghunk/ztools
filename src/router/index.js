import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
  { path: '/github-star', name: 'GithubStar', component: () => import('@/views/GithubStarView.vue') },
  { path: '/github-folder-download', name: 'GithubFolderDownload', component: () => import('@/views/GithubFolderDownloadView.vue') },
  { path: '/iconfont', name: 'Iconfont', component: () => import('@/views/IconfontView.vue') },
  { path: '/iconfont-merge', name: 'IconfontMerge', component: () => import('@/views/IconfontMergeView.vue') },
  { path: '/timestamp', name: 'Timestamp', component: () => import('@/views/TimestampView.vue') },
  { path: '/ip', name: 'Ip', component: () => import('@/views/IpView.vue') },
  { path: '/twitter-video-download', name: 'TwitterVideoDownload', component: () => import('@/views/TwitterVideoDownloadView.vue') },
  { path: '/ipfs-image', name: 'IpfsImage', component: () => import('@/views/IpfsImageView.vue') },
  { path: '/vividshare', name: 'Vividshare', component: () => import('@/views/VividshareView.vue') }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
