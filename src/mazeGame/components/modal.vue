<template>
<div v-show="modalShow" class="score_container">
    <div class="score">
        记分板
    </div>
    <button @click = 'nextClick'>下一关</button>
</div>
</template>

<script>
import { boardcast, bcType } from '../subject'
import { throttleTime, filter} from 'rxjs/operators'

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
            })
    },
    methods: {
        nextClick() {
            this.modalShow = false;
            boardcast.next({type: bcType.HXP_REVIVE});
            boardcast.next({type: bcType.LEVEL_HIDE});
            boardcast.next({ type: bcType.VICTORY });
        }
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
