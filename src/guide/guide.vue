<template>
    <div class="guide" :style="{ width: width + 'px', height: height + 'px' }">
    </div>
</template>


<script>
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
</style>