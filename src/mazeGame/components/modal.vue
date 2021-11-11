<template>
<div v-show="modalShow" class="score_container" :style="{ backgroundImage: bg_img }">
    <div class="score">
        {{ score }}
    </div>
    <div class="next-btn" :style="{backgroundImage: btn_img}" @click="nextClick"></div>
</div>
</template>

<script>
import { boardcast, bcType } from '../subject'
import { throttleTime, filter, map} from 'rxjs/operators'

export default {
    name: 'MazeModal',
    data: function(){
        return {
            modalShow: false,
            score: 0,
            awardCount: 0,
            getAward:0,
            time: 0,
            bg_img: "",
            btn_img: ""
        }     
    },
    mounted: function(){
        boardcast
            .pipe(filter(data => data.type === bcType.MAZE_CLOSING), map(data => data.value))
            .subscribe((value) => {
                this.getAward = value.awardNum;
                this.time = value.time;
            })
        boardcast
            .pipe(filter(data => data.type === bcType.HXP_SLEEP), throttleTime(500))
            .subscribe((data) => {
                this.awardCount = data.value;
                this.score = Math.floor((this.getAward / this.awardCount) * 360 - this.time);
                if (this.score < 0) {
                    this.score = 10;
                }
                if (this.score > 200) {
                    this.bg_img = "url('/img/great.png')";
                    this.btn_img = "url('/img/great_btn.png')"
                } else if (this.score > 130) {
                    this.bg_img = "url('/img/better.png')";
                    this.btn_img = "url('/img/better_btn.png')"

                } else {
                    this.bg_img = "url('/img/normal.png')";
                    this.btn_img = "url('/img/normal_btn.png')"

                }
                this.modalShow = true;
            })

        document.addEventListener('keydown', (ev) => {
            this.keyNext(ev);
        })
        
    },
    methods: {
        nextClick() {
            this.modalShow = false;
            boardcast.next({type: bcType.HXP_REVIVE});
            boardcast.next({type: bcType.LEVEL_HIDE});
            boardcast.next({ type: bcType.VICTORY });
        },

        keyNext(ev) {
            if (ev.keyCode === 13 && this.modalShow) {
                this.nextClick();
            }
        }
    }

}
</script>

<style scoped>

.score_container{
    position: absolute;
    width: 30%;
    height: 0;
    padding-bottom: 36.9%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-image: url('../../../public/img/great.png');
    background-size: cover;
    z-index: 10;
    transition: display 1s;
}

.score{
    position: absolute;
    font-family: 'Aroal Black';
    font-size: 4.5vw;
    font-weight: bolder;
    color: #f5a000;
    top: 55%;
    left: 50%;
    transform: translate(-45%, -65%);    
    text-align: center;
}

.next-btn {
    position: absolute;
    bottom: 3%;
    left: 2%;
    width: 99%;
    padding-bottom: 19.6%;
    background-size: cover;
    cursor: pointer;
}
</style>
