<template>
  <div>
    <h2>时间戳转换工具</h2>
    <div class="flex gap-4 items-start">
      <el-input
        v-model="input"
        type="textarea"
        :rows="6"
        placeholder="输入时间戳，比如 1703051862540 或者 1703052085"
        class="flex-1"
      />
      <span class="text-gray-500 py-2">=></span>
      <el-input v-model="output" type="textarea" :rows="6" readonly class="flex-1" />
    </div>
  </div>
</template>

<script>
export default {
  name: "TimestampView",
  data() {
    return {
      input: "输入时间戳，比如 1703051862540 或者 1703052085",
      output: "输入时间戳，比如 2023-12-20 13:57:42 或者 2023-12-20 14:01:25",
    };
  },
  watch: {
    input() {
      this.convertTimestamp();
    },
  },
  methods: {
    convertTimestamp() {
      const regex = /\b\d+\b/g;
      const matched = this.input.match(regex);
      if (!matched) {
        this.output = "解析失败，未找到有效的数字时间戳";
        return;
      }
      let result = this.input;
      const replaced = new Set();
      matched.forEach((timestamp) => {
        if (!replaced.has(timestamp)) {
          const ms = timestamp.length === 10 ? timestamp * 1000 : parseInt(timestamp);
          const date = new Date(ms);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          result = result.replaceAll(timestamp, formatted);
          replaced.add(timestamp);
        }
      });
      this.output = result;
    },
  },
};
</script>
