import { debounce } from "throttle-debounce";

export default {
  props: {
    autoSize: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultWidth: 1,
      defaultScale: 1.0
    };
  },
  computed: {
    containerWidth() {
      return document.getElementById("viewerContainer").clientWidth
        ? document.getElementById("viewerContainer").clientWidth
        : null;
    }
  },
  mounted() {
    this.defaultWidth = document.getElementById("viewerContainer").clientWidth;
    if (this.containerWidth && this.autoSize) {
      this.scale = this.defaultScale;
      window.addEventListener("resize", debounce(this.resizePdf, 100));
    }
  },
  beforeDestory() {
    window.removeEventListener("resize", this.resizePdf);
  },
  methods: {
    resizePdf() {
      const currentwidth = document.getElementById("viewerContainer")
        .clientWidth;
      this.scale =
        this.defaultScale * (currentwidth / this.defaultWidth).toFixed(2);
    }
  }
};
