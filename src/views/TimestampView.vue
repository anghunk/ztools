<template>
  <div>
    <h2>时间戳转换工具</h2>
    <div>
      <textarea v-model="input" placeholder="输入时间戳，比如 1703051862540 或者 1703052085"></textarea>
      <p>自动转换 ==></p>
      <textarea v-model="output" readonly></textarea>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimestampView',
  data() {
    return {
      input: '',
      output: ''
    }
  },
  watch: {
    input() {
      this.convertTimestamp()
    }
  },
  methods: {
    convertTimestamp() {
      const input = this.input
      const regex = /\b\d+\b/g
      const matched = input.match(regex)
      if (!matched) {
        this.output = '解析失败，未找到有效的数字时间戳'
        return
      }
      let result = input
      const replaced = new Set()
      matched.forEach(timestamp => {
        if (!replaced.has(timestamp)) {
          const ms = timestamp.length === 10 ? timestamp * 1000 : parseInt(timestamp)
          const date = new Date(ms)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          const seconds = String(date.getSeconds()).padStart(2, '0')
          const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
          result = result.replaceAll(timestamp, formatted)
          replaced.add(timestamp)
        }
      })
      this.output = result
    }
  }
}
</script>
