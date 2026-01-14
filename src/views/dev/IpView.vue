<template>
  <div>
    <h2>获取 IP 地址</h2>
    <div>
      <p>
        您的当前ip地址为：
        <el-input v-model="ipouput" style="width: 300px; margin-right: 10px"></el-input>
        <el-button type="primary" @click="getIpOut">获取</el-button>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "IpView",
  data() {
    return {
      ipouput: "loading...",
    };
  },
  created() {
    this.getIpOut();
  },
  methods: {
    getIpOut() {
      this.ipouput = "loading...";
      fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then((data) => {
          this.ipouput = data.ip;
        })
        .catch((error) => {
          console.error("获取IP地址时出错:", error);
          ElMessage.error("接口错误，请切换代理！");
        });
    },
  },
};
</script>
