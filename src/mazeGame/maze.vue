<template>
<div>
    <strong class="level">层数：</strong>
    <div class="hxp"></div>
    <div class="shade">
      <strong>加载中...</strong>
    </div>
    <video id="video" playsinline></video>
    <maze-modal></maze-modal>
    <maze-tip></maze-tip>
    <award-hint></award-hint>
</div>
</template>

<script>
import getMaze from './maze';
import MazeModal from './components/modal.vue';
import MazeTip from './components/tip.vue';
import AwardHint from './components/awardHint.vue'



export default {
    name: 'Maze',
    components: {
        MazeModal,
        MazeTip,
        AwardHint
    },
    mounted: function(){
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
.hxp{
    display: none;
    position: absolute;
    width: 100px;
    height: 100px;
    top: 50%;
    left: 50%;
    background-image: url('../../public/hxp_run/run.png');
    background-position: 0 0;
    background-size: cover;
    transform: translate(-50%, -50%) ;
    transition: transform 0.5s;
}
.level {
    display: none;
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

.shade{
    background-image: url('../../public/texture/concrete.png');
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
