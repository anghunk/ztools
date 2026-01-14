# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

ztools 是一个纯前端工具集合网站，提供 GitHub 统计、字体处理、时间戳转换等开发者工具。在线地址：https://ztools.zishu.me

## 开发命令

```bash
npm run dev      # 启动开发服务器（localhost:8081）
npm run build    # 生产构建，输出到 dist/
npm run preview  # 预览生产构建
```

## 技术栈

- 构建工具：Vite 5
- 前端框架：Vue 3 + Element Plus
- 路由：Vue Router 4
- 样式：Sass
- 其他：jszip、opentype.js

## 代码架构

```
src/
├── main.js              # 应用入口，挂载 Vue、Router、Element Plus
├── App.vue              # 根组件（侧边栏 + router-view）
├── router/index.js      # 路由配置（Hash 模式）
├── components/          # 公共组件
│   └── AppAside.vue     # 侧边导航栏
├── views/               # 页面视图组件（每个工具一个 Vue 文件）
└── styles/index.scss    # 全局样式
```

## 添加新工具

1. 在 `src/views/` 下创建 `XxxView.vue` 组件
2. 在 `src/router/index.js` 中添加路由（使用动态导入）
3. 在 `src/components/AppAside.vue` 中添加导航链接
