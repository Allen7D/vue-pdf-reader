<template>
  <div id="app" style="height: 100%;">
    <div style="position: fixed; bottom: 50px; left: 0; z-index: 2; width: 100%">
      <p>
        <input type="text" v-model="pageNum">
        <span> / {{ this.pageSize }}</span>
      </p>
      <p>
        <button @click="handlePrevPage">上一页</button>
        <button @click="handleNextPage">下一页</button>
      </p>
      <p>
        <button @click="handleZoomIn">放大</button>
        <button @click="handleZoomOut">缩小</button>
        <button @click="handleFitWidth">自适应宽度</button>
      </p>
    </div>
    <pdf-reader ref="pdf" :url="url" :page-size.sync="pageSize" :scale="scale" :single-page-mode="true" :current-page="pageNum" auto-size style="height: 100%; overflow:hidden;"/>
  </div>
</template>

<script>
import PdfReader from "./components/pdf-reader.vue";
// const defaultPageUrl = "http://localhost:5020/api/pdf"
const defaultPageUrl = "http://10.10.164.211:8080/1.pdf";
// 备用PDF地址
// const defaultPageUrl = "https://faholo-1256200971.cos.ap-shanghai.myqcloud.com/%E5%88%86%E7%BA%A7%E9%98%85%E8%AF%BB/001%20At%20the%20park.pdf";

export default {
  name: "app",
  components: {
    PdfReader
  },
  data() {
    return {
      pageNum: 1,
      pageSize: 14,
      scale: 1.0,
      url: defaultPageUrl
    };
  },
  watch: {},
  methods: {
    handlePrevPage() {
      if (this.pageNum > 1) {
        this.pageNum--;
      }
    },
    handleNextPage() {
      if (this.pageNum < this.pageSize) {
        this.pageNum++;
      }
    },
    handleZoomIn() {
      this.scale += 0.25;
    },
    handleZoomOut() {
      if (this.scale > 0.25) {
        this.scale -= 0.25;
      }
    },
    handleFitWidth() {
      this.$refs.pdf.fitWidth();
    }
  }
};
</script>

<style>
html {
  height: 100%;
}
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
div {
  display: block;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
