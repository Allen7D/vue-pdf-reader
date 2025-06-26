<template>
  <div id="viewerContainer" class="container" >
    <div class="pdfViewer" id="viewer"
         ref="viewer" v-scroll.immediate="updateScrollBounds">
    </div>
  </div>
</template>

<script>
import PDFJS from "pdfjs-dist";
import Vue from "vue";

import autoSize from "./mixins";
import resize from "../directives/resize";
import scroll from "../directives/scroll";

import { range } from "../utils/index";

import PageComponent from "./extend"; // PageComponent是一个包含「组件选项」的对象
const PageConstructor = Vue.extend(PageComponent); // 使用「基础 Vue 构造器」创建一个"子类"（可以用于实例化）

const PIXEL_RATIO = window.devicePixelRatio || 1,
  VIEWPORT_RATIO = 0.98;

function getPDFPage(PDFDoc, pageNum) {
  return new Promise(function(resolve, reject) {
    PDFDoc.getPage(pageNum).then(PDFPage => resolve(PDFPage));
  });
}

// 返回一个有序的数组
function getAllPDFPages(PDFDoc) {
  const pageSize = PDFDoc._pdfInfo.numPages;
  const allPages = range(1, pageSize + 1).map(index => PDFDoc.getPage(index));
  return Promise.all(allPages);
}
// 渲染出文字(废弃)
function renderTextLayer(PDFPage, pageNum, container, viewport) {
  PDFPage.getTextContent().then(textContent => {
    PDFJS.renderTextLayer({
      textContent,
      container,
      viewport,
      textDivs: []
    });
  });
}

export default {
  name: "PDFReader",
  directives: {
    resize,
    scroll
  },
  mixins: [autoSize],
  props: {
    url: {
      type: String,
      required: true
    },
    singlePageMode: {
      type: Boolean,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1
    },
    scale: {
      type: Number,
      default: 1.0
    }
  },
  data() {
    return {
      PDFDoc: undefined,
      PDFPages: [],
      focusPageNum: 1,
      increment: 0.25,
      pages: [],
      scrollTop: 0, // 已经滚动的距离
      clientHeight: 0, // 当前页面高度
      pageSize: 0 // PDF总页数
    };
  },
  computed: {
    defaultViewport() {
      if (!this.PDFPages.length) return {width: 0, height: 0};
      const [page] = this.PDFPages;
      return page.getViewport(1.0);
    },
    pageSize() {
      const _pageSize = this.PDFDoc ? this.PDFDoc._pdfInfo.numPages : 0;
      this.$emit("page-size", _pageSize);
      return _pageSize;
    },
    scrollBottom() {
      return this.scrollTop + this.clientHeight;
    },
    pagesRenderList() {
      return this.pages.map(page => page.isRendered);
    },
    // 计算自适应宽度的缩放比例
    fitWidthScale() {
      const { defaultViewport, $el } = this;
      if (!defaultViewport.width || !$el) return 1.0;
      const containerWidth = $el.clientWidth;
      return (containerWidth * VIEWPORT_RATIO) / defaultViewport.width;
    }
  },
  watch: {
    scale(newVal, oldVal) {
      this.pages.forEach(page => {
        page.scale = newVal;
      });
    },
    pagesRenderList(newVal, oldVal) {
      // console.log("watch", newVal);
    },
    focusPageNum(newVal, oldVal) {
      this.setCurrentPage(newVal);
    },
    currentPage(newVal, oldVal) {
      if (this.singlePageMode && newVal !== oldVal) {
        this.updateCurrentPage()
      }
    }
  },
  mounted() {
    this.generateBlankPages(this.url);
    // 监听窗口大小变化，自适应宽度
    this.handleResize = () => {
      this.fitToWidth();
    };
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
  },
  methods: {
    // 自适应页面宽度
    fitToWidth() {
      const { defaultViewport, $el } = this;
      const containerWidth = $el ? $el.clientWidth : 0;
      const defaultViewportWidth = defaultViewport.width;
      const calculatedScale = this.fitWidthScale;
      const currentScale = this.scale;
      
      console.log('PDF渲染完成后自适应宽度:', {
        containerWidth,
        defaultViewportWidth,
        calculatedScale,
        currentScale
      });
      
      if (calculatedScale && calculatedScale !== currentScale && calculatedScale > 0) {
        this.$emit('update:scale', calculatedScale);
        this.pages.forEach(page => {
          page.scale = calculatedScale;
        });
      }
    },
    updatePageGeom() {
      this.pages.forEach(page => {
        page.scrollTop = this.scrollTop;
        page.scrollBottom = this.scrollBottom;
        page.clientHeight = this.clientHeight;
      });
    },
    updateScrollBounds() {
      const { clientHeight } = this.$el;
      this.scrollTop = this.$refs["viewer"].scrollTop;
      this.clientHeight = clientHeight;
      // console.log({scrollTop: this.scrollTop, clientHeight})
      this.updatePageGeom();
    },
    // 生成空白的PDF页面
    async generateBlankPages(url) {
       this.PDFDoc = await PDFJS.getDocument(url);
       this.pageSize = this.PDFDoc.numPages;
       this.$emit('update:pageSize', this.pageSize);
       
       if (this.singlePageMode) {
         const page = await this.PDFDoc.getPage(this.currentPage);
         this.PDFPages = [page];
         await this.renderSinglePage();
       } else {
         this.PDFPages = await getAllPDFPages(this.PDFDoc);
         await this.renderAllPages();
       }
       
       // PDF渲染完成后自适应宽度
       this.fitToWidth();
     },
    async renderAllPages() {
      let viewer = this.$refs["viewer"];
      const pages = [];
      
      // 创建所有页面组件
      range(1, this.pageSize + 1).forEach(index => {
        const page = new PageConstructor({
          propsData: {
            // 只用于 new 创建的实例中
            page: this.PDFPages[index - 1],
            focusPageNum: this.focusPageNum,
            num: index,
            scale: this.scale
          }
        });
        page.id = `page_${this.seed++}`;
        page.vm = page.$mount(); // 手动地挂载; 额外添加vm属性
        page.scrollTop = this.scrollTop;
        page.scrollBottom = this.scrollBottom;
        page.clientHeight = this.clientHeight;
        viewer.appendChild(page.vm.$el);
        this.pages.push(page);
        pages.push(page);
      });
      
      // 等待DOM更新完成
      await this.$nextTick();
      
      // 收集所有渲染任务
      const renderPromises = [];
      pages.forEach(page => {
        const renderTask = page.vm.renderContext();
        if (renderTask && renderTask.promise) {
          renderPromises.push(renderTask.promise);
        }
      });
      
      // 等待所有页面渲染完成
      await Promise.all(renderPromises);
    },
    async renderSinglePage() {
      let viewer = this.$refs["viewer"];
      // 清空现有页面
      viewer.innerHTML = '';
      this.pages = [];
      
      const page = new PageConstructor({
        propsData: {
          page: this.PDFPages[0],
          focusPageNum: this.focusPageNum,
          num: this.currentPage,
          scale: this.scale
        }
      });
      page.id = `page_${this.seed++}`;
      page.vm = page.$mount();
      page.scrollTop = this.scrollTop;
      page.scrollBottom = this.scrollBottom;
      page.clientHeight = this.clientHeight;
      viewer.appendChild(page.vm.$el);
      this.pages.push(page);
      
      // 等待页面渲染完成
      await this.$nextTick();
      const renderTask = page.vm.renderContext();
      if (renderTask && renderTask.promise) {
        await renderTask.promise;
      }
    },
    async updateCurrentPage() {
       if (this.singlePageMode && this.PDFDoc && this.currentPage >= 1 && this.currentPage <= this.pageSize) {
         const page = await this.PDFDoc.getPage(this.currentPage);
         this.PDFPages = [page];
         await this.renderSinglePage();
         // 页面渲染完成后自适应宽度
         this.fitToWidth();
       }
     },
    async renderPDF(url) {
      this.PDFDoc = await PDFJS.getDocument(url);
    },
    setCurrentPage(pageNum) {
      if (pageNum < 1 || pageNum > this.pageSize) return;
      const pageIndex = pageNum - 1;
      this.$refs["viewer"].scrollTop = this.pages[pageIndex].pageTop;
    },
    onPrevPage() {
      if (this.focusPageNum <= 1) return; // 已经到顶
      this.focusPageNum -= 1;
    },
    onNextPage() {
      if (this.focusPageNum >= this.pageSize) return; // 已经到底
      this.focusPageNum += 1;
    },
    zoomIn() {
      this.scale += this.increment;
      this.updatePageGeom();
    },
    zoomOut() {
      if (this.scale <= 0.25) return;
      this.scale -= this.increment;
      this.updatePageGeom();
    },
    // 公开方法：手动触发自适应宽度
    fitWidth() {
      this.fitToWidth();
    }
  }
};
</script>

<style scoped>
.container {
  overflow: auto;

  position: relative;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

#viewer {
  overflow: auto;

  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;

  background: #525f69;
}

.textLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0.2;
  line-height: 1;
}

.textLayer > div {
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  -webkit-transform-origin: 0% 0%;
  -moz-transform-origin: 0% 0%;
  -o-transform-origin: 0% 0%;
  -ms-transform-origin: 0% 0%;
  transform-origin: 0% 0%;
}

.textLayer .highlight {
  margin: -1px;
  padding: 1px;

  background-color: rgb(180, 0, 170);
  border-radius: 4px;
}

.textLayer .highlight.begin {
  border-radius: 4px 0px 0px 4px;
}

.textLayer .highlight.end {
  border-radius: 0px 4px 4px 0px;
}

.textLayer .highlight.middle {
  border-radius: 0px;
}

.textLayer .highlight.selected {
  background-color: rgb(0, 100, 0);
}

.textLayer ::selection {
  background: rgb(0, 0, 255);
}
.textLayer ::-moz-selection {
  background: rgb(0, 0, 255);
}

.textLayer .endOfContent {
  display: block;
  position: absolute;
  left: 0px;
  top: 100%;
  right: 0px;
  bottom: 0px;
  z-index: -1;
  cursor: default;
  -webkit-user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
}

.textLayer .endOfContent.active {
  top: 0px;
}

.annotationLayer section {
  position: absolute;
}

.annotationLayer .linkAnnotation > a {
  position: absolute;
  font-size: 1em;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.annotationLayer .linkAnnotation > a /* -ms-a */ {
  background: url("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")
    0 0 repeat;
}

.annotationLayer .linkAnnotation > a:hover {
  opacity: 0.2;
  background: #ff0;
  box-shadow: 0px 2px 10px #ff0;
}

.annotationLayer .textAnnotation img {
  position: absolute;
  cursor: pointer;
}

.annotationLayer .popupWrapper {
  position: absolute;
  width: 20em;
}

.annotationLayer .popup {
  position: absolute;
  z-index: 200;
  max-width: 20em;
  background-color: #ffff99;
  box-shadow: 0px 2px 5px #333;
  border-radius: 2px;
  padding: 0.6em;
  margin-left: 5px;
  cursor: pointer;
  word-wrap: break-word;
}

.annotationLayer .popup h1 {
  font-size: 1em;
  border-bottom: 1px solid #000000;
  padding-bottom: 0.2em;
}

.annotationLayer .popup p {
  padding-top: 0.2em;
}

.annotationLayer .highlightAnnotation,
.annotationLayer .underlineAnnotation,
.annotationLayer .squigglyAnnotation,
.annotationLayer .strikeoutAnnotation,
.annotationLayer .fileAttachmentAnnotation {
  cursor: pointer;
}

.pdfViewer .canvasWrapper {
  overflow: hidden;
}

.pdfViewer .page {
  direction: ltr;
  width: 816px;
  height: 1056px;
  margin: 1px auto -8px auto;
  position: relative;
  overflow: visible;
  background-clip: content-box;
  background-color: white;
}

.pdfViewer.removePageBorders .page {
  margin: 0px auto 10px auto;
  border: none;
}

.pdfViewer .page canvas {
  margin: 0;
  display: block;
}

.pdfViewer .page .loadingIcon {
  position: absolute;
  display: block;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.pdfPresentationMode:-webkit-full-screen .pdfViewer .page {
  margin-bottom: 100%;
  border: 0;
}

.pdfPresentationMode:-moz-full-screen .pdfViewer .page {
  margin-bottom: 100%;
  border: 0;
}

.pdfPresentationMode:-ms-fullscreen .pdfViewer .page {
  margin-bottom: 100% !important;
  border: 0;
}

.pdfPresentationMode:fullscreen .pdfViewer .page {
  margin-bottom: 100%;
  border: 0;
}
</style>
