<template>
  <div>
    <h2>GitHub 下载指定文件夹</h2>
    <div>
      <p>将你想下载的 GitHub 仓库文件夹 url 复制到下面输入框即可。</p>
      <section class="m-p-input-container">
        <el-input
          v-model="url"
          :disabled="downloading"
          :readonly="downloading"
          placeholder="请输入 GitHub 当前页面链接"
          style="width: 500px"
          class="mr-3"
        ></el-input>
        <el-button
          type="primary"
          v-if="!downloading"
          @click="getFileList"
          :class="{ disable: downloading }"
          >解析下载</el-button
        >
      </section>

      <template v-if="fileInfoList.length > 0">
        <div
          v-if="errorNum && downloadIndex >= fileInfoList.length"
          @click="retryAll"
          style="cursor: pointer; color: #409eff"
        >
          重新下载错误文件
        </div>
        <div
          v-if="finishNum"
          @click="forceDownload"
          style="cursor: pointer; color: #409eff"
        >
          强制下载现有文件
        </div>
        <div>
          碎片总量：{{ fileInfoList.length }}，已下载：{{ finishNum }}，错误：{{
            errorNum
          }}，进度：{{ ((finishNum / fileInfoList.length) * 100).toFixed(2) }}%
        </div>
        <section class="file-list">
          <div
            v-for="(item, index) in fileInfoList"
            :key="index"
            :class="['file-item', item.status]"
            @click="retry(index)"
            :title="item.path"
          >
            <span>{{ index + 1 }}</span> {{ item.absoluteUrl }}
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script>
import JSZip from "jszip";

export default {
  name: "GithubFolderDownloadView",
  data() {
    return {
      url: "",
      downloading: false,
      isBlob: false,
      errorNum: 0,
      finishNum: 0,
      downloadIndex: 0,
      fileInfoList: [],
      projectInfo: {
        ownerName: "",
        projectName: "",
        branchName: "",
        dirPath: "",
      },
    };
  },
  created() {
    this.getSource();
    window.addEventListener("keyup", this.onKeyup);
  },
  beforeUnmount() {
    window.removeEventListener("keyup", this.onKeyup);
  },
  methods: {
    getSource() {
      let { href } = location;
      if (href.indexOf("?source=") > -1) {
        this.url = href.split("?source=")[1];
      }
    },
    onKeyup(event) {
      if (event.keyCode === 13) {
        this.getFileList();
      }
    },
    ajax(options) {
      options = options || {};
      let xhr = new XMLHttpRequest();
      if (options.type === "file") {
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
    checkBranchAndTags(branchAndPath, callback) {
      if (!branchAndPath) {
        callback();
        return;
      }
      if (branchAndPath.indexOf("blob/") === 0) {
        this.isBlob = true;
        branchAndPath = branchAndPath.replace("blob/", "");
      } else {
        branchAndPath = branchAndPath.replace("tree/", "");
      }
      let branchList = [];
      this.ajax({
        url: `https://api.github.com/repos/${this.projectInfo.ownerName}/${this.projectInfo.projectName}/branches`,
        success: (treeStr) => {
          branchList = [...branchList, ...JSON.parse(treeStr)];
          this.ajax({
            url: `https://api.github.com/repos/${this.projectInfo.ownerName}/${this.projectInfo.projectName}/tags`,
            success: (treeStr) => {
              [...branchList, ...JSON.parse(treeStr), { name: "master" }]
                .map((item) => item.name)
                .some((branch) => {
                  if (branchAndPath.indexOf(branch) === 0) {
                    this.projectInfo.branchName = branch;
                    this.projectInfo.dirPath =
                      branchAndPath.replace(branch, "").replace("/", "") +
                      (this.isBlob ? "" : "/");
                    return true;
                  }
                });
              callback && callback(branchList);
            },
            fail: () => this.alertError("链接不正确，请查看链接是否有效"),
          });
        },
        fail: () => this.alertError("链接不正确，请查看链接是否有效"),
      });
    },
    getFileList() {
      if (!this.url) {
        ElMessage.warning("请输入链接");
        return;
      } else if (this.downloading) {
        ElMessage.warning("资源下载中，请稍后");
        return;
      }
      this.downloading = true;
      this.url = decodeURIComponent(this.url);
      const pathParams = this.url.replace("https://github.com/", "").trim().split("/");
      this.projectInfo.ownerName = pathParams[0];
      this.projectInfo.projectName = pathParams[1];
      this.projectInfo.branchName = pathParams[3];
      this.checkBranchAndTags(pathParams.slice(2).join("/"), () => {
        if (this.isBlob) {
          this.fileInfoList = [
            {
              status: "",
              path: this.projectInfo.dirPath,
              absoluteUrl: `https://raw.githubusercontent.com/${this.projectInfo.ownerName}/${this.projectInfo.projectName}/${this.projectInfo.branchName}/${this.projectInfo.dirPath}`,
            },
          ];
          this.downloadFile();
        } else {
          this.ajax({
            url: `https://api.github.com/repos/${this.projectInfo.ownerName}/${this.projectInfo.projectName}/git/trees/${this.projectInfo.branchName}?recursive=1`,
            success: (treeStr) => {
              JSON.parse(treeStr).tree.forEach((item) => {
                if (
                  item.path.indexOf(this.projectInfo.dirPath) === 0 &&
                  item.type !== "tree"
                ) {
                  item.absoluteUrl = `https://raw.githubusercontent.com/${this.projectInfo.ownerName}/${this.projectInfo.projectName}/${this.projectInfo.branchName}/${item.path}`;
                  item.status = "";
                  this.fileInfoList.push(item);
                }
              });
              this.downloadFile();
            },
            fail: () => {
              this.alertError("链接不正确，请查看链接是否有效");
            },
          });
        }
      });
    },
    downloadFile() {
      let download = () => {
        let index = this.downloadIndex;
        this.downloadIndex++;
        if (this.fileInfoList[index] && !this.fileInfoList[index].status) {
          this.ajax({
            url: this.fileInfoList[index].absoluteUrl,
            type: "file",
            success: (file) => {
              this.dealFile(file, index, () => {
                this.downloadIndex < this.fileInfoList.length && download();
              });
            },
            fail: () => {
              this.errorNum++;
              this.fileInfoList[index].status = "error";
              if (this.downloadIndex < this.fileInfoList.length) {
                download();
              }
            },
          });
        } else if (this.downloadIndex < this.fileInfoList.length) {
          download();
        }
      };
      for (let i = 0; i < 10; i++) {
        download(i);
      }
    },
    retry(index) {
      if (this.fileInfoList[index].status === "error") {
        this.fileInfoList[index].status = "";
        this.ajax({
          url: this.fileInfoList[index].absoluteUrl,
          type: "file",
          success: (file) => {
            this.errorNum--;
            this.dealFile(file, index);
          },
          fail: () => {
            this.fileInfoList[index].status = "error";
          },
        });
      }
    },
    dealFile(file, index, callback) {
      this.fileInfoList[index].fileData = file;
      this.fileInfoList[index].status = "finish";
      this.finishNum++;
      this.finishNum === this.fileInfoList.length && this.downloadZip();
      callback && callback();
    },
    retryAll() {
      this.errorNum = 0;
      this.downloadIndex = 0;
      this.fileInfoList.forEach((item) => {
        if (item.status === "error") {
          item.status = "";
        }
      });
      this.downloadFile();
    },
    forceDownload() {
      if (this.fileInfoList.length) {
        this.downloadZip();
      } else {
        ElMessage.warning("当前无已下载文件");
      }
    },
    downloadZip() {
      const zip = new JSZip();
      this.fileInfoList.forEach(
        (item) => item.status === "finish" && zip.file(item.path, item.fileData)
      );
      zip.generateAsync({ type: "blob" }).then((content) => {
        let a = document.createElement("a");
        a.download = `${[
          this.projectInfo.projectName,
          this.projectInfo.branchName,
          this.projectInfo.dirPath,
        ]
          .join("/")
          .replace(/\//g, "_")}.zip`;
        a.href = URL.createObjectURL(content);
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    },
    alertError(tips) {
      ElMessage.warning(tips);
      this.downloading = false;
    },
  },
};
</script>

<style scoped>
.m-p-input-container {
  margin: 15px 0;
}
.file-list {
  margin-top: 15px;
  max-height: 400px;
  overflow-y: auto;
}
.file-item {
  padding: 5px;
  font-size: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  word-break: break-all;
}
.file-item.finish {
  color: #67c23a;
}
.file-item.error {
  color: #f56c6c;
}
</style>
