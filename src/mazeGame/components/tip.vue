<template>
<div class="score" :show='`${tipShow}`' >
    {{ time }} | 01:00:00
    <div>
        已获得奖励个数：{{ awardNum }}
    </div>
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
            return `${minuteS}:${secondS}:${millisecondeS}`;
        }
    },
    mounted: function(){
        boardcast
            .pipe(filter(data => data.type === bcType.TIP_SHOW))
            .subscribe(() => {
                // this.tipShow = !this.tipShow;
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
    right: 0;
    top: 21px;
    height: 18%;
    width: 30%;
    background-color:aliceblue;
    transition: transform 1s;
}

.score[show='false'] {
    transform: translateX(100%);
}

.score[show='true'] {
    transform: translateX(0);
}

</style>