<template>
<div>
    <strong v-show="levelShow"  class="level">层数：{{level}} </strong>
    <shade></shade>
    <video id="video" playsinline></video>
    <maze-modal></maze-modal>
    <maze-tip></maze-tip>
    <award-hint></award-hint>
    <hxp></hxp>
</div>
</template>

<script>
import getMaze from './maze';
import MazeModal from './components/modal.vue';
import MazeTip from './components/tip.vue';
import AwardHint from './components/awardHint.vue';
import Hxp from './components/hxp.vue';
import Shade from './components/shade.vue'
import { bcType, boardcast } from './subject';
import { filter } from 'rxjs/operators'



export default {
    name: 'Maze',
    data: function() {
        return {
            level: 1,
            levelShow: false,
        }
    },
    components: {
        MazeModal,
        MazeTip,
        AwardHint,
        Hxp,
        Shade,
    },
    mounted: function(){
        boardcast
            .pipe(filter(data => data.type === bcType.VICTORY))
            .subscribe(() => {
                this.level += 1;
            })
        boardcast
            .pipe(filter(data => data.type === bcType.LEVEL_SHOW))
            .subscribe(() => {
                
                this.levelShow = true;
            })
        boardcast
            .pipe(filter(data => data.type === bcType.LEVEL_HIDE))
            .subscribe(() => {
                this.levelShow = false;
            }) 
        getMaze().start();
    }
}

</script>

<style>
body{
    margin: 0 0;
    padding: 0 0;
    overflow: hidden;
}

.level {
    position: absolute;
    top: 25px;
    left: 30px;
    font-size: 25px;
    color: aliceblue;
}

#video{
    -webkit-transform: scaleX(-1);
    transform: scaleX(-1);
    width: auto;
    height: auto;
    display: none;
}


</style>
