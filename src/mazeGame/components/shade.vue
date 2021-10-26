<template>
    <div v-show="show" class="shade" :style="{ width: width, height: height }">
      <strong>加载中...</strong>
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
            height: 0
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

    },
    methods: {
        onResize() {
            this.width = window.innerWidth + 'px';
            this.height = window.innerHeight + 'px';
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
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) ;
    font-size: 25px;
    color: aliceblue;
}

</style>
