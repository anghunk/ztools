<template>
  <div>
    <h2>ipfs 图床</h2>
    <div>
      <p>文件上传到 ipfs，支持各种类型的图片和 mp4 视频。</p>
      <input ref="fileInput" type="file" multiple style="display: none;" @change="handleFileChange">
      <div class="container">
        <div class="upload" :class="{ dragenter: isDragging }">
          <div class="content" @click="triggerUpload" @dragover.prevent @dragenter.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
            <svg class="icon" viewBox="0 0 1335 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path d="M1097.060174 392.125217C1073.730783 172.966957 893.261913 0.378435 666.089739 0.378435c-227.127652 0-415.610435 171.920696-430.948174 391.746782C101.910261 415.454609 0 525.356522 0 666.601739c0 149.147826 125.239652 274.476522 274.476522 274.476522h195.828869v-78.669913H274.476522a193.691826 193.691826 0 0 1-195.940174-195.806609c0-102.021565 70.678261-180.580174 172.588522-195.917913l54.561391-8.013913 8.013913-62.553043c16.005565-180.580174 172.588522-321.157565 352.389565-321.157566 180.580174 0 337.029565 141.356522 352.389565 321.157566v62.553043l62.664348 8.013913c101.910261 16.005565 172.477217 93.896348 172.477218 195.917913 0 109.901913-85.904696 195.806609-195.806609 195.806609h-195.917913v78.580869h196.029217c149.147826 0 274.476522-125.261913 274.476522-274.476521 0-141.133913-101.999304-259.072-235.25287-274.387479" fill="#909399"></path>
              <path d="M612.218435 364.766609l1.335652 2.003478L389.698783 590.58087l55.229217 55.362782 181.938087-181.938087V1018.88h78.558609v-78.58087h156.471652-156.471652V458.039652l183.808 183.919305 55.340521-55.340522-277.147826-277.058783-55.229217 55.229218z" fill="#909399"></path>
            </svg>
            <p class="desc">点击上传 / 粘贴上传 / 拖拽上传</p>
            <p class="desc">永久的、去中心化保存和共享文件</p>
          </div>
        </div>
        <div class="filelist">
          <div class="title">
            上传列表
            <div v-if="fileList.length > 0" class="copyall">
              线路
              <button v-for="g in gateways" :key="g.value" @click="changeGateway(g.value)">{{ g.label }}</button>
            </div>
            <div v-if="fileList.length > 0" class="copyall">
              <button @click="copyAll">复制全部</button>
            </div>
          </div>
          <div class="list">
            <div v-for="(item, index) in fileList" :key="index" class="item">
              <div class="file">
                <div class="desc">
                  <div class="desc__name">{{ item.name }}</div>
                  <div class="desc__size">SIZE: {{ formatBytes(item.size) }}</div>
                </div>
                <a v-if="item.url" :href="item.url" target="_blank" class="link">链接</a>
                <button class="link" @click="removeFile(index)">删除</button>
              </div>
              <div class="progress">
                <div class="progress-bar">
                  <div class="progress-inner" :class="{ success: item.status === 'success', error: item.status === 'error' }" :style="{ width: item.progress + '%' }"></div>
                </div>
              </div>
              <input v-if="item.url" type="text" :value="item.url" readonly @click="copyUrl(item.url)">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'

export default {
  name: 'IpfsImageView',
  data() {
    return {
      isDragging: false,
      currentGateway: 'https://ipfs.io',
      gateways: [
        { label: '国际1', value: 'https://ipfs.io' },
        { label: '国际2', value: 'https://cf-ipfs.com' },
        { label: '中国1', value: 'https://cdn.ipfsscan.io' },
        { label: '中国2', value: 'https://ipfs.fleek.co' },
        { label: '本地', value: 'http://localhost:8080' }
      ],
      fileList: []
    }
  },
  mounted() {
    document.addEventListener('paste', this.handlePaste)
  },
  beforeUnmount() {
    document.removeEventListener('paste', this.handlePaste)
  },
  methods: {
    triggerUpload() {
      this.$refs.fileInput.click()
    },
    handleFileChange(e) {
      this.upload(e.target.files)
      e.target.value = ''
    },
    handleDrop(e) {
      this.isDragging = false
      this.upload(e.dataTransfer.files)
    },
    handlePaste(e) {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) this.upload([file])
        }
      }
    },
    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    upload(files) {
      const maxSize = 5242880 * 20
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.size >= maxSize) {
          ElMessage.error('上传的文件不能超过 100MB')
          continue
        }
        const fileItem = {
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'uploading',
          url: '',
          hash: ''
        }
        this.fileList.push(fileItem)
        const index = this.fileList.length - 1
        const formData = new FormData()
        formData.append('file', file)
        const xhr = new XMLHttpRequest()
        xhr.open('POST', 'https://cdn.ipfsscan.io/api/v0/add?pin=false')
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            this.fileList[index].progress = Math.floor((e.loaded / e.total) * 100)
          }
        })
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText)
            if (res.Hash) {
              this.fileList[index].status = 'success'
              this.fileList[index].hash = res.Hash
              this.fileList[index].url = `${this.currentGateway}/ipfs/${res.Hash}?filename=${res.Name}`
            } else {
              this.fileList[index].status = 'error'
            }
          } else {
            this.fileList[index].status = 'error'
          }
        }
        xhr.onerror = () => {
          this.fileList[index].status = 'error'
        }
        xhr.send(formData)
      }
    },
    removeFile(index) {
      this.fileList.splice(index, 1)
    },
    changeGateway(gateway) {
      this.currentGateway = gateway
      this.fileList.forEach(item => {
        if (item.hash) {
          item.url = `${gateway}/ipfs/${item.hash}?filename=${item.name}`
        }
      })
    },
    copyUrl(url) {
      navigator.clipboard.writeText(url).then(() => {
        ElMessage.success('复制成功')
      })
    },
    copyAll() {
      const urls = this.fileList.filter(f => f.url).map(f => f.url).join('\n')
      navigator.clipboard.writeText(urls).then(() => {
        ElMessage.success('复制成功')
      })
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.upload {
  width: 300px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}
.upload:hover,
.upload.dragenter {
  border-color: #409eff;
}
.upload .icon {
  width: 60px;
  height: 60px;
}
.upload .desc {
  color: #909399;
  margin: 5px 0;
}
.filelist {
  flex: 1;
  min-width: 300px;
}
.filelist .title {
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.copyall {
  display: flex;
  gap: 5px;
  align-items: center;
}
.copyall button {
  padding: 2px 8px;
  font-size: 12px;
}
.list .item {
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}
.file {
  display: flex;
  align-items: center;
  gap: 10px;
}
.file .desc {
  flex: 1;
}
.desc__name {
  font-weight: 500;
  word-break: break-all;
}
.desc__size {
  font-size: 12px;
  color: #999;
}
.file .link {
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
  font-size: 14px;
}
.progress {
  margin: 10px 0;
}
.progress-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}
.progress-inner {
  height: 100%;
  background: #409eff;
  transition: width 0.3s;
}
.progress-inner.success {
  background: #67c23a;
}
.progress-inner.error {
  background: #f56c6c;
}
.item input {
  width: 100%;
  margin-top: 5px;
}
</style>
