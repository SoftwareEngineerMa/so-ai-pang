<template>
    <div v-show="show" class="hxp" :style="{ transform: transform, width: width + 'px', height: height + 'px' }"></div>
</template>

<script>
import { boardcast, bcType } from '../subject';
import { filter, map } from 'rxjs/operators';
import Animation from '../animation';


const posMirror = new Map([
    ['left', 'right'],
    ['right', 'left'],
    ['top', 'bottom'],
    ['bottom', 'top']
])


export default {
    name: 'Hxp',
    data: function() {
        return {
            show: false,
            angle: 0,
            toward: 'left',
            animation: null,
            width: 0,
            height:0,
            winResize: true
        }
    },
    computed: {
        transform() {
            return `translate(-50%, -50%) rotate(${this.angle}deg`;
        }
    },
    mounted: function() {
        this.onResize();
        window.addEventListener('resize', () => {
            // 如果 camera 视角高度发生变化，不允许窗口自适应
            if (this.winResize) {
                this.onResize();
            }
        })
        
        boardcast
            .pipe(filter(data => data.type === bcType.HXP_RUN))
            .subscribe(this.animation.draw);
        boardcast
            .pipe(filter(data => data.type === bcType.HXP_TURE_TO), map(data => data.value))
            .subscribe(this.dealTowards)
        boardcast
            .pipe(filter(data => data.type === bcType.HXP_SHOW))
            .subscribe(() => {
                this.show = true;
            })
        boardcast
            .pipe(filter(data => data.type === bcType.HXP_HIDE))
            .subscribe(() => {
                this.show = false;
            })
        boardcast
            .pipe(filter(data => data.type === bcType.MAZE_SCROLL), map(data => data.value))
            .subscribe((value) => {
                this.onResize(Math.floor(window.innerHeight * 0.15) * 5 / value);
                if (value !== 5) {
                    this.winResize = false;
                }
            })

    },
    methods: {
        onResize(width){
            const w = width ?? Math.floor(window.innerHeight * 0.15);
            this.width = w;
            this.height = w;
            const el = document.querySelector('.hxp');
            el.style.backgroundPosition = '0';
            if (!this.animation) {
                this.animation = new Animation(el, w, 5, 6);
            } else {
                this.animation.animationWidth = w;
                this.animation.xpos = 0;
            }
        },
        dealTowards(axis) {
            if (this.toward === 'top') {
                if (axis[0] === 1) {
                    this.angle += 90;
                    this.toward = 'right';
                } else if (axis[0] === -1) {
                    this.angle -= 90;
                    this.toward = 'left';
                } else if (axis[1] === -1) {
                    this.angle += 180;
                    this.toward = 'bottom'
                }
            } else if (this.toward === 'right') {
                if (axis[1] === 1) {
                    this.angle -= 90;
                    this.toward = 'top';
                } else if (axis[1] === -1) {
                    this.angle += 90;
                    this.toward = 'bottom';
                } else if (axis[0] === -1) {
                    this.angle -= 180;
                    this.toward = 'left';
                }
            } else if (this.toward === 'bottom') {
                if (axis[1] === 1) {
                    this.angle -= 180;
                    this.toward = 'top';
                } else if (axis[0] === 1) {
                    this.angle -= 90;
                    this.toward = 'right';
                } else if (axis[0] === -1) {
                    this.angle += 90
                    this.toward = 'left'
                }
            } else if (this.toward === 'left') {
                if (axis[0] === 1) {
                    this.angle += 180;
                    this.toward = 'right';
                } else if (axis[1] === -1) {
                    this.angle -= 90;
                    this.toward = 'bottom';
                } else if (axis[1] === 1) {
                    this.angle += 90;
                    this.toward = 'top';
                }
            }
        }
    },
    watch: {
        toward(val, oldVal) {
            if (val !== oldVal) {
                boardcast.next({ type: bcType.HXP_DIVERSION, value: posMirror.get(val)});
            }
        }
    }

}
</script>

<style>
.hxp {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 50%;
    left: 50%;
    background-image: url('../../../public/hxp_run/run.png');
    background-position: 0 0;
    background-size: cover;
    transition: transform 0.5s;
}

</style>