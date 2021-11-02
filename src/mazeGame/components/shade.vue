<template>
    <div v-show="show" class="shade" :style="{ width: width, height: height }">
      <strong>加载中...</strong>
      <div class="intro" v-show="in_show">
          <div class="close" @click="introClose"></div>
      </div>
      <div class="loading"></div>
    </div>
</template>


<script>
import { bcType, boardcast } from '../subject';
import { filter } from 'rxjs/operators'

export default {
    name: 'Shade',
    data: function(){
        return {
            show: true,
            width: 0,
            height: 0,
            in_show: true
        }
    },
    mounted: function() {
        this.onResize();
        boardcast
            .pipe(filter(data => data.type === bcType.SHADE_SHOW))
            .subscribe(() => {
                this.show = true;
            })
        boardcast
            .pipe(filter(data => data.type === bcType.SHADE_HIDE))
            .subscribe(() => {
                this.show = false;
            })
        window.onresize = this.onResize;
    },
    methods: {
        onResize() {
            this.width = window.innerWidth + 'px';
            this.height = window.innerHeight + 'px';
        },

        introClose() {
            this.in_show = false;
        }
    }
}
</script>

<style scoped>

.shade{
    background-image: url('../../../public/texture/concrete.png');
    background-size:contain;
}

.shade strong{
    display: block;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translateX(-50%) ;
    font-size: 2vw;
    color: aliceblue;
}
.intro {
    position: absolute;
    width: 60%;
    height: 0;
    padding-bottom: 49.8%;
    border-radius: 15px;
    background-image: url('../../../public/img/maze_intro.png');
    background-size: cover;
    top: 50%;
    left: 50%;
    z-index: 100;
    transform: translate(-50%, -50%);
    
}

.loading {
    position: absolute;
    width: 50%;
    height: 0;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding-bottom: 4.3%;
    /* border-radius: 20px; */
    background-image: url('../../../public/loading.gif');
    background-size: cover;
    z-index: 10;
}

.close {
    position: absolute;
    right: 0;
    width: 30px;
    height: 30px;
    background-image: url('../../../public/img/close.png');
    background-size: cover;
    cursor: pointer;
}

</style>
