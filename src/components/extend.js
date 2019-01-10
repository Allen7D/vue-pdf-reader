import Page from './page.vue'

export default {
  extends: Page,
  data() {
    return {
      renderTask: undefined,
      width: 0,
      height: 0,
      pageTop: 0,
      scrollTop: 0,
      scrollBottom: 0,
      clientHeight: 0
    }
  },
  watch: {
    scale(newVal, oldVal) {
      // const radio = newVal / oldVal
      // this.width = this.width * radio
      // this.height = this.height * radio
      this.width = this.actualSizeViewport.width // this.width * radio
      this.height = this.actualSizeViewport.height // this.height * radio
      this.pageTop = this.$el.offsetTop
      this.renderTask = undefined
      this.renderPage()
    },
    scrollTop() {
      this.renderPage()
    },
    page(newPage, oldPage) {
      this.destroyPage(oldPage)
    },
  },
  created() {
    this.viewport = this.page.getViewport(this.scale)
    this.width = this.viewport.width
    this.height = this.viewport.height
  },
  mounted() {
    // 当前页上下4页左右的都渲染
    // if (this.focusPageNum - 4 <= this.num || this.num <= this.focusPageNum + 4) {
    //   this.renderPage()
    // }
    this.$nextTick(() => {
      this.pageTop = this.$el.offsetTop // // page与顶部距离
      this.renderPage()
    })
  },
  computed: {
    actualSizeViewport() {
      return this.viewport.clone({scale: this.scale});
    },
    pageBottom() {
      return this.pageTop + this.pageHeight
    },
    pageHeight() {
      // page的高度
      return this.height // this.$el.clientHeight || this.$el.offsetHeight
    },
    pageStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`
      }
    },
    canvasWrapperStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`
      }
    },
    textLayerStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`
      }
    }
  }
}