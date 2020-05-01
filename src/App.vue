<template>
  <div id="app" style="height: 100%;">
    <div style="position: fixed; top: 50px; left: 20px;z-index: 2;">
      <p>
        <input type="text" v-model="pageNum">
        <span> / {{ 14 }}</span>
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
      <pdf-reader ref="pdf" :url="url"  auto-size style="height: 100%; overflow:hidden;"/>
  </div>
</template>

<script>
  import PdfReader from './components/pdf-reader.vue'

  export default {
    name: 'app',
    components: {
      PdfReader
    },
    data() {
      return {
        pageNum: 1,
        url: 'http://localhost:5020/api/pdf'
        // url: 'http://0.0.0.0:5010/static/files/example.pdf'
        // url: 'https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK'
      }
    },
    watch: {
      pageNum(newVal) {
        this.handleSetCurrentPage(newVal)
      }
    },
    methods: {
      handleSetCurrentPage(PageNum) {
        this.$refs['pdf'].setCurrentPage(PageNum)
      },
      handlePrevPage() {
        this.$refs['pdf'].onPrevPage()
      },
      handleNextPage() {
        this.$refs['pdf'].onNextPage()
      },
      handleZoomIn() {
        this.$refs['pdf'].zoomIn()
      },
      handleZoomOut() {
        this.$refs['pdf'].zoomOut()
      },
    }
  }
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
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
</style>
