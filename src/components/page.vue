<template>
  <div class="page" :style="pageStyle" :id="`pageContainer${num}`" :data-page-number="num" data-loade="false">
    <div :style="canvasWrapperStyle" class="canvasWrapper">
      <canvas :id="`page${num}`" ref="canvas"></canvas>
    </div>
    <div :style="textLayerStyle" class="textLayer"></div>
  </div>
</template>

<script type="text/ecmascript-6">
import PDFJS from "pdfjs-dist";

export default {
  name: "Page",
  props: {
    page: {
      type: Object
    },
    focusPageNum: {
      type: Number,
      default: 1
    },
    num: {
      type: Number,
      default: 0
    },
    scale: {
      type: Number,
      default: 1.0
    }
  },
  beforeDestory() { },
  computed: {
    containerWidth() {
      return document.getElementById("viewerContainer").clientWidth
        ? document.getElementById("viewerContainer").clientWidth
        : null;
    },
    canvasWrapper() {
      return this.$el.querySelector(".canvasWrapper");
    },
    canvas() {
      return this.$el.querySelector("canvas");
    },
    textLayer() {
      return this.$el.querySelector(".textLayer");
    },
    viewport() {
      const scale = (this.containerWidth - 20) / this.page.view[2]
      return this.page.getViewport(scale);
    },
    eleId() {
      return `pageContainer${this._uid}`;
    },
    pageStyle() {
      return {};
    },
    canvasWrapperStyle() {
      return {};
    },
    textLayerStyle() {
      return {};
    }
  },
  methods: {
    renderPage() {
      if (this.renderTask) return;
      // 在单页模式下，直接渲染当前页面，不需要可见性检查
      this.renderContext();
      this.renderTextLayer();
      this.isRendered = true;
    },
    /**
     * 渲染Canvas：在网页上将PDF对应的页面逐一画出
     */
    renderContext() {
      let canvas = this.$refs["canvas"],
        canvasContext = this.canvas.getContext("2d");
      const scale = (this.containerWidth - 20) / this.page.view[2]
      const viewport = this.page.getViewport(scale);
      // 获取设备像素比，提高清晰度
      const pixelRatio = Math.min((window.devicePixelRatio || 1) * 10, 10); // 限制最大像素比为10，避免过度消耗内存

      // 设置canvas的实际像素尺寸（高分辨率）
      canvas.height = viewport.height * pixelRatio;
      canvas.width = viewport.width * pixelRatio;
      // 设置canvas的显示尺寸（CSS尺寸），保持在容器内
      canvas.style.height = viewport.height + 'px';
      canvas.style.width = viewport.width + 'px';

      // 缩放绘图上下文以匹配设备像素比
      canvasContext.scale(pixelRatio, pixelRatio);

      const renderContext = {
        canvasContext,
        viewport,
      };
      this.renderTask = this.page.render(renderContext);
      return this.renderTask;
    },
    /**
     * 渲染文字：在Canvas上浮一层对应的文字
     */
    renderTextLayer() {
      const container = this.textLayer;
      container.innerHTML = "";
      const scale = (this.containerWidth - 20) / this.page.view[2]
      const viewport = this.page.getViewport(scale);
      // 设置文本层的尺寸以匹配canvas显示尺寸，保持在容器内
      container.style.width = viewport.width + 'px';
      container.style.height = viewport.height + 'px';

      this.page.getTextContent().then(textContent => {
        PDFJS.renderTextLayer({
          textContent,
          container,
          viewport,
          textDivs: []
        });
      });
    }
  }
};
</script>

<style scoped>
.page {
  overflow: visible;

  position: relative;

  margin: 10px auto;

  background-color: black;
  background-clip: content-box;
}
</style>
