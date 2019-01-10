<template>
  <div class="page" :style="pageStyle"
       :id="`pageContainer${num}`" :data-page-number="num" data-loade="false">
    <div :style="canvasWrapperStyle" class="canvasWrapper">
      <canvas :id="`page${num}`" ref="canvas"></canvas>
    </div>
    <div :style="textLayerStyle" class="textLayer"></div>
  </div>
</template>

<script type="text/ecmascript-6">
  import PDFJS from 'pdfjs-dist'
  const EXTRA_RANGE = 3000
  export default {
    name: 'Page',
    props: {
      page: {
        type: Object,
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
      },
    },
    beforeDestory() {
    },
    computed: {
      canvasWrapper() {
        return this.$el.querySelector('.canvasWrapper')
      },
      canvas() {
        return this.$el.querySelector('canvas')
      },
      textLayer() {
        return this.$el.querySelector('.textLayer')
      },
      eleId() {
        return `pageContainer${this._uid}`
      },
      pageStyle() {
        return {}
      },
      canvasWrapperStyle() {
        return {}
      },
      textLayerStyle() {
        return {}
      },
    },
    methods: {
      renderPage() {
        if (this.renderTask) return
        const {pageTop, pageBottom, scrollTop, scrollBottom} = this
        console.log({pageTop, pageBottom, scrollTop, scrollBottom})
        // let isPageVisible = pageTop < scrollBottom && pageBottom > scrollTop
        let isPageVisible = (scrollTop-EXTRA_RANGE < pageTop  && pageTop < scrollBottom+EXTRA_RANGE) || (scrollTop-EXTRA_RANGE < pageBottom && pageBottom < scrollBottom+EXTRA_RANGE)
        if (isPageVisible) {
          console.log('isPageVisible', isPageVisible)
//          console.log('num', this.num)
//          const {pageTop, pageBottom, pageHeight, scrollTop, scrollBottom} = this
//          console.log({pageTop, pageBottom, pageHeight, scrollTop, scrollBottom})
          this.renderContext()
          this.renderTextLayer()
        }
      },
      renderContext() {
        let canvas = this.$refs['canvas'],
          ctx = this.canvas.getContext("2d")
        const viewport = this.page.getViewport(this.scale)
        // 放缩 scale的比例与 viewport.height & viewport.width一致
        canvas.height = viewport.height
        canvas.width = viewport.width
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        }
        this.renderTask = this.page.render(renderContext)
        return this.renderTask
      },
      // 渲染出文字
      renderTextLayer() {
        const container = this.textLayer
        container.innerHTML = ''
        const viewport = this.page.getViewport(this.scale)
        this.page.getTextContent().then(textContent => {
          PDFJS.renderTextLayer({
            textContent,
            container,
            viewport,
            textDivs: []
          })
        })
      }
    }
  }
</script>

<style scoped>
  .page {
    margin: 10px auto;
    background-color: black;
    background-clip: content-box;
    position: relative;
    overflow: visible;
  }
</style>
