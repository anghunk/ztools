<template>
  <div>
    <h2>解析 iconfont 字体文件</h2>
    <div>
      <div class="flex" style="margin-bottom: 15px">
        <el-button
          type="primary"
          v-if="iconList.length > 0"
          @click="copyType = copyType === 'value' ? 'name' : 'value'"
          >复制 {{ copyType }}</el-button
        >
        <el-button type="primary" v-if="iconList.length > 0" @click="reload"
          >重新解析</el-button
        >
      </div>

      <section class="p-input-container" v-if="iconList.length === 0">
        <div class="file-box">
          <div class="input-box">
            <label>解析本地 ttf、woff、otf 文件</label>
            <el-button type="primary" @click="$refs.fileInput.click()"
              >选择文件</el-button
            >
            <input
              ref="fileInput"
              type="file"
              @change="getLocalTTF"
              accept=".ttf,.woff,.otf"
              class="hidden"
            />
          </div>
        </div>
      </section>

      <section v-else>
        <p>点击模块即可复制对应数据。</p>
        <div class="list">
          <div
            class="item"
            v-for="(item, index) in iconList"
            :key="index"
            @click="copyToClipboard(item[copyType])"
          >
            <svg
              v-if="isSymbol"
              class="icon"
              aria-hidden="true"
              v-html="`<use xlink:href='${item.value}'></use>`"
            ></svg>
            <div
              v-else
              class="iconfont"
              v-html="isCSS ? '' : item.show"
              :class="isCSS ? item.show : ''"
            ></div>
            <div>{{ item.name }}</div>
            <div>{{ item.value }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import opentype from "opentype.js";

export default {
  name: "IconfontView",
  data() {
    return {
      timeouter: 0,
      copyType: "value",
      bufferStr: null,
      isSymbol: false,
      isCSS: false,
      iconList: [],
      url: "",
    };
  },
  created() {
    const urlObj = new URL(location.href);
    const url = urlObj.searchParams.get("source");
    if (url) {
      this.url = decodeURIComponent(url);
      this.getURLFile();
    }
  },
  methods: {
    ajax(options) {
      options = options || {};
      let xhr = new XMLHttpRequest();
      if (options.type === "buffer") {
        xhr.responseType = "arraybuffer";
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          let status = xhr.status;
          if (status >= 200 && status < 300) {
            options.success && options.success(xhr.response);
          } else {
            options.fail && options.fail(status);
          }
        }
      };
      xhr.open("GET", options.url, true);
      xhr.send(null);
    },
    getURLFile() {
      if (!this.url) {
        alert("请输入链接");
        return;
      }
      const urlObj = new URL(location.href);
      urlObj.searchParams.set("source", encodeURIComponent(this.url));
      window.history.replaceState(null, "", urlObj.href);

      if (this.url.toLowerCase().indexOf(".ttf") !== -1) {
        this.getOnlineTTF();
      } else if (this.url.toLowerCase().indexOf(".css") !== -1) {
        this.getOnlineCSS();
      } else if (this.url.toLowerCase().indexOf(".js") !== -1) {
        this.getOnlineJS();
      }
    },
    getLocalTTF(event) {
      let file = event.target.files[0];
      let reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (evt) => {
        this.parseIcon(evt.target.result);
      };

      let readerBase64 = new FileReader();
      readerBase64.readAsDataURL(file);
      readerBase64.onload = (evt) => {
        this.setStyle(evt.target.result);
      };
    },
    getOnlineTTF() {
      this.ajax({
        url: this.url,
        type: "buffer",
        success: (params) => {
          this.parseIcon(params);
        },
      });
      this.setStyle(this.url);
    },
    getOnlineCSS() {
      this.isCSS = true;
      this.ajax({
        url: this.url,
        success: (params) => {
          this.setStyle("", params);
          params.replace(/\.([^:^ ]+):[\s\S]+?content: "\\([^"]+)";/gi, (...item) => {
            this.iconList.push({
              show: item[1],
              name: item[1],
              value: `&#${item[2]};`,
            });
          });
        },
      });
    },
    getOnlineJS() {
      this.isSymbol = true;
      this.ajax({
        url: this.url,
        success: (params) => {
          let $script = document.createElement("script");
          $script.src = this.url;
          document.body.append($script);
          params.replace(/id="([^"]+)"/gi, (...item) => {
            this.iconList.push({
              show: item[1].replace(/icon/, ""),
              name: item[1].replace(/icon/, ""),
              value: `#${item[1]}`,
            });
          });
        },
      });
    },
    parseIcon(bufferStr) {
      this.bufferStr = bufferStr;
      this.iconList = [];
      let result = opentype.parse(this.bufferStr);
      for (let key in result.glyphs.glyphs) {
        let item = result.glyphs.glyphs[key];
        if (item.unicode) {
          this.iconList.push({
            name: item.name,
            show: `&#${item.unicode};`,
            value: `&#${item.unicode};`,
          });
        }
      }
      this.iconList.forEach((item) => {
        item.value = item.value.replace(/&#([^;]+);/gi, (target, value) => {
          return `&#x${parseInt(value).toString(16)};`;
        });
      });
    },
    setStyle(url, cssFile) {
      let $style = document.createElement("style");
      if (cssFile) {
        $style.innerHTML = cssFile;
      } else {
        $style.innerHTML = `
          @font-face {
            font-family: 'iconfont';
            src: url('${url}') format('truetype');
          }
          .iconfont {
            font-family: "iconfont" !important;
            font-size: 24px;
            font-style: normal;
            -webkit-font-smoothing: antialiased;
            -webkit-text-stroke-width: 0.2px;
            -moz-osx-font-smoothing: grayscale;
          }`;
      }
      document.body.append($style);
    },
    copyToClipboard(content) {
      clearTimeout(this.timeouter);
      ElMessage.success(`复制成功：${content}`);
      if (!document.queryCommandSupported("copy")) return false;
      let $input = document.createElement("input");
      $input.style.opacity = "0";
      $input.value = content;
      document.body.appendChild($input);
      $input.select();
      const result = document.execCommand("copy");
      document.body.removeChild($input);
      return result;
    },
    reload() {
      const urlObj = new URL(location.href);
      urlObj.searchParams.delete("source");
      location.href = urlObj.href;
    },
  },
};
</script>

<style scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.item {
  width: 120px;
  padding: 10px;
  border: 1px solid #eee;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
}
.item:hover {
  background: #f5f5f5;
}
.item .iconfont {
  font-size: 32px;
  margin-bottom: 5px;
}
.item div:last-child {
  font-size: 12px;
  color: #999;
  word-break: break-all;
}
.file-box {
  margin: 20px 0;
}
.input-box label {
  display: block;
  margin-bottom: 10px;
}
</style>
