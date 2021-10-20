<template>
<div class="score" :show='`${tipShow}`'>
    {{ time }}
    <div>
        已获得奖励个数：{{ awardNum }}
    </div>
</div>
</template>

<script>
import { bcType, boardcast } from '../subject'
import { filter, map,} from 'rxjs/operators'

export default {
    name: 'MazeTip',
    data: function(){
        return {
            tipShow: false,
            time: '',
            awardNum: 0
        }     
    },
    mounted: function(){
        // boardcast
        //     .pipe(filter(data => data.type === bcType.HXP_SLEEP), throttleTime(100))
        //     .subscribe(() => {
        //         console.log('pppp');
        //         this.tipShow = true;
        //         boardcast.next({type:bcType.HXP_REVIVE});
        //     })
        // boardcast
        //     .pipe(filter(data => data.type === bcType.HXP_REVIVE), delay(2000))
        //     .subscribe(() => {
        //         this.tipShow = false;
        //     })
        boardcast
            .pipe(filter(data => data.type === bcType.TIP_SHOW))
            .subscribe(() => {
                this.tipShow = !this.tipShow;
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