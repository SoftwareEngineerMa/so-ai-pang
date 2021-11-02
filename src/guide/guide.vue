<template>
    <div class="guide" :style="{ width: width + 'px', height: height + 'px' }">
        <div class="close" @click="closeClick"></div>
    </div>
</template>


<script>
import { ipcRenderer } from "electron";

export default {
    name: 'Guide',
    data() {
        return {
            width: window.innerWidth,
            height: window.innerWidth * 0.7359
        }
    },
    mounted: function() {
        this.onResize();
        console.log(window.innerWidth, window.innerHeight);
        window.onresize = this.onResize
    },
    methods: {
        onResize() {
            this.width = window.innerWidth;
            this.height = window.innerWidth * 0.7359
        },

        closeClick() {
            ipcRenderer.send('guide-close');
        }
    }

}
</script>

<style scoped>
body {
    padding: 0 0;
    margin: 0 0;
}
.guide {
    border-radius: 20px;
    background-image: url('/img/guide.png');
    background-size: cover;
}

.close {
    position: absolute;
    right: 2px;
    width: 30px;
    height: 30px;
    background-image: url('../../public/img/close.png');
    background-size: cover;
    cursor: pointer;
}
</style>