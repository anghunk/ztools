<template>
  <div class="aside">
    <h1><router-link to="/">ztools</router-link></h1>
    <div class="nav-groups">
      <div class="nav-group" v-for="group in groups" :key="group.title">
        <div class="group-title">{{ group.title }}</div>
        <ul>
          <li v-for="item in group.items" :key="item.path">
            <router-link :to="item.path" :class="{ active: $route.path === item.path }">{{ item.name }}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppAside',
  data() {
    return {
      groups: [
        {
          title: 'GitHub 工具',
          items: [
            { name: 'Github Star 统计', path: '/github-star' },
            { name: 'GitHub 下载指定文件夹', path: '/github-folder-download' },
          ]
        },
        {
          title: '字体工具',
          items: [
            { name: '解析 iconfont 字体', path: '/iconfont' },
            { name: '合并 iconfont 字体', path: '/iconfont-merge' }
          ]
        },
        {
          title: '开发工具',
          items: [
            { name: '时间戳转换', path: '/timestamp' },
            { name: '获取 IP 地址', path: '/ip' }
          ]
        },
        {
          title: '社交媒体',
          items: [
            { name: '推特视频下载', path: '/twitter-video-download' },
            { name: '推文截图美化', path: '/vividshare' }
          ]
        },
        {
          title: '图片工具',
          items: [
            { name: 'IPFS 图床', path: '/ipfs-image' }
          ]
        }
      ]
    }
  }
}
</script>
