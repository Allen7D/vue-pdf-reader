<template>
  <div id="app" style="height: 100%;">
    <div style="position: fixed; bottom: 50px; width: 100%; z-index: 2; background-color: rgba(0, 0, 0, 0.5);">
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
      </p>
    </div>
    <pdf-reader ref="pdf" :url="url" :page-size.sync="pageSize" auto-size style="height: 100%; overflow:hidden;"/>
  </div>
</template>

<script>
import PdfReader from "./components/pdf-reader.vue";

export default {
  name: "app",
  components: {
    PdfReader
  },
  data() {
    return {
      pageNum: 1,
      pageSize: 14,
      url: 'http://192.168.0.101:8080/001%20At%20the%20park.pdf',
      // url: 'http://192.168.0.101:8080/example.pdf'
      // url: "http://localhost:5020/api/pdf"
      // url: 'https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK'
    };
  },
  watch: {
    pageNum(newVal) {
      this.handleSetCurrentPage(newVal);
    }
  },
  methods: {
    handleSetCurrentPage(PageNum) {
      this.$refs["pdf"].setCurrentPage(PageNum);
    },
    handlePrevPage() {
      this.$refs["pdf"].onPrevPage();
    },
    handleNextPage() {
      this.$refs["pdf"].onNextPage();
    },
    handleZoomIn() {
      this.$refs["pdf"].zoomIn();
    },
    handleZoomOut() {
      this.$refs["pdf"].zoomOut();
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
