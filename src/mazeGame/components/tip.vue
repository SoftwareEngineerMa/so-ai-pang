<template>
<div class="score" :show='`${tipShow}`' >
    <div class="aw"></div><span id='aw-num'>{{ awardNum }}</span>
    <div id='time'>{{ time }}</div>
</div>
</template>

<script>
import { bcType, boardcast } from '../subject'
import { filter, map,} from 'rxjs/operators'
import { timer } from 'rxjs'

export default {
    name: 'MazeTip',
    data: function(){
        return {
            tipShow: false,
            awardNum: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
            timer: null
        }     
    },
    computed: {
        time() {
            let minuteS = this.minute === 0 ? '00' : null;
            let secondS = this.second === 0 ? '00' : null;
            let millisecondeS = this.millisecond === 0 ? '00' : null;
            if (!minuteS){
                minuteS = this.minute < 10 ? `0${this.minute}` : `${this.minute}`;
            }
            if (!secondS) {
                secondS = this.second < 10 ? `0${this.second}` : `${this.second}`;
            }
            if (!millisecondeS) {
                millisecondeS = this.millisecond < 10 ? `0${this.millisecond}` : `${this.millisecond}`;
            }
            return `${minuteS} : ${secondS} : ${millisecondeS}`;
        }
    },
    mounted: function(){
        boardcast
            .pipe(filter(data => data.type === bcType.TIP_SHOW))
            .subscribe(() => {
                this.tipShow = !this.tipShow;
                if (this.tipShow) {
                    if (timer) {
                        clearInterval(timer)
                    }
                    this.timer = setInterval( this.timeUpdate, 10)
                }
            })

        boardcast
            .pipe(filter(data => data.type === bcType.HINT_SHOW))
            .subscribe(() => {
                this.awardNum += 1;
            })
        boardcast
            .pipe(filter(data => data.type === bcType.TIMER_UPDATE), map((data) => data.value))
            .subscribe((val) => {
                this.time = val;
            })
        boardcast
            .pipe(filter(data => data.type === bcType.TIP_UPDATE))
            .subscribe(() => {
                boardcast.next({ type: bcType.MAZE_CLOSING, value: { awardNum: this.awardNum, time: this.minute * 60 + this.second }});
                clearInterval(this.timer);
                this.minute = this.second = this.millisecond = 0;
                this.awardNum = 0;
            })
    },
    methods: {
        timeUpdate() {
            this.millisecond += 1;
            if (this.millisecond > 100) {
                this.millisecond = 0;
                this.second += 1;
            }
            if(this.second > 60) {
                this.second = 0;
                this.minute += 1;
            }
        },
    },
    watch: {
        // tipShow :function(val) {
            
        // }
    }
}
</script>



<style scoped>
.score {
    position: absolute;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    text-align: center;
    font-size: 2.2vw;
    color: aliceblue;
    /* padding-top: 10px; */
    right: 0;
    width: 24%;
    height: 0;
    padding-bottom: 9%;
    background-color:rgba(51, 51, 51,0.7);
    transition: transform 1s;
}

.score[show='false'] {
    transform: translateX(100%);
}

.score[show='true'] {
    transform: translateX(0);
}

.score #time {
    margin-top: 21%;
    margin-right: 4%;
    font-size: 2.2vw;
    color: aliceblue;
}

.score #aw-num {
    position: absolute;
    font-size: 1.8vw;
    font-weight: bold;
    top: 20px;
    right: 21%;
}

.aw {
    position: absolute;
    display: inline-block;
    width: 10%;
    height: 0;
    padding-bottom: 10%;
    top: 24px;
    right: 31%;
    background-image: url('../../../public/img/aw.png');
    background-size: cover;
}

</style>