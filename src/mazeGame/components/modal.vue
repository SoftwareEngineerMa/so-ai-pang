<template>
<transition name="fade">
<div v-show="modalShow" class="score_container">
    <div class="score">
        记分板
    </div>
</div>
</transition>
</template>

<script>
import { boardcast, bcType } from '../subject'
import { throttleTime, filter, delay,} from 'rxjs/operators'

export default {
    name: 'MazeModal',
    data: function(){
        return {
            modalShow: false,
        }     
    },
    mounted: function(){
        boardcast
            .pipe(filter(data => data.type === bcType.HXP_SLEEP), throttleTime(500))
            .subscribe(() => {
                this.modalShow = true;
                boardcast.next({type:bcType.HXP_REVIVE});
            })
        boardcast
            .pipe(filter(data => data.type === bcType.HXP_REVIVE), delay(2000))
            .subscribe(() => {
                this.modalShow = false;
            })
    }

}
</script>

<style scoped>

.score_container{
    position: absolute;
    width: 50%;
    height: 40%;
    top: 50%;
    left: 50%;
    border: 1px solid #fff;
    border-radius: 15px;
    background-color: aliceblue;
    transform: translate(-50%, -50%);
    z-index: 10;
    transition: display 1s;
}

.score{
    width: 100%;
    height: 60%;
    text-align: center;
    /* background-image: url('/img/score.png'); */
    background-size: cover;
}
</style>
