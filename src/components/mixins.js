import { debounce } from 'lodash'

export default {
    props: {
        autoSize: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            defaultWidth: 612,
            defaultScale: 1.0,
        }
    },
    computed: {
        containerWidth() {
            return document.getElementById('viewerContainer').clientWidth ?
                document.getElementById('viewerContainer').clientWidth : null
        },
    },
    mounted() {
        if (this.containerWidth && this.autoSize) {
            this.scale = this.defaultScale * ((this.containerWidth - 40) / this.defaultWidth).toFixed(2)
            window.addEventListener('resize', debounce(this.resizePdf, 100))
        }
    },
    beforeDestory() {
        window.removeEventListener('resize', this.resizePdf)
    },
    methods: {
        resizePdf() {
            const currentwidth = document.getElementById('viewerContainer').clientWidth
            this.scale = this.defaultScale * ((currentwidth - 40) / this.defaultWidth).toFixed(2)
        }
    }
}
