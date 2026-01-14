<template>
  <div>
    <h2>Github Star 统计</h2>
    <div>
      <el-input
        v-model="account"
        placeholder="请输入 GitHub 用户名"
        class="mr-3"
        style="width: 300px"
      ></el-input>
      <el-button type="primary" @click="getGitStatus">统计</el-button>
      <el-button class="delete" @click="clearLocal">清理缓存</el-button>
      <p></p>
      <el-table :data="gitItemList" style="width: 100%">
        <el-table-column label="项目名" width="400">
          <template #default="scope">
            <span>{{ scope.row.full_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="star" width="100">
          <template #default="scope">
            {{ scope.row.stargazers_count }}
          </template>
        </el-table-column>
        <el-table-column label="fork" width="100">
          <template #default="scope">
            {{ scope.row.forks_count }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <a :href="'https://github.com/' + scope.row.full_name" target="_blank"
              >前往 GitHub 仓库</a
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";

export default {
  name: "GithubStarView",
  data() {
    return {
      gitItemList: [],
      account: "",
    };
  },
  methods: {
    getGitStatus() {
      if (!this.account.trim()) {
        ElMessage.error("请输入统计账号");
        return;
      }
      localStorage.setItem("account", this.account);
      ElMessage.info("数据统计中，请稍后！");
      fetch(`https://api.github.com/users/${this.account}/repos?page=1&per_page=100`)
        .then((res) => {
          if (res.status === 404) {
            ElMessage.error("账号不存在，请重新检查！");
          }
          return res.json();
        })
        .then((data) => {
          ElMessage.success("解析成功！");
          this.gitItemList = data;
          this.gitItemList.sort((a, b) => b.stargazers_count - a.stargazers_count);
          localStorage.setItem("gitItemList", JSON.stringify(this.gitItemList));
        });
    },
    clearLocal() {
      localStorage.removeItem("gitItemList");
      location.reload();
    },
  },
  mounted() {
    const gitItemList = JSON.parse(localStorage.getItem("gitItemList"));
    if (gitItemList) {
      this.gitItemList = gitItemList;
    }
  },
};
</script>
