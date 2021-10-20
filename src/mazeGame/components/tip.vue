<template>
<div v-show="tipShow" class="score">
</div>
</template>

<script>
// import { boardcast, bcType } from '../subject'
// import { throttleTime, filter, delay,} from 'rxjs/operators'

export default {
    name: 'MazeTip',
    data: function(){
        return {
            tipShow: true,
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
}

</style>