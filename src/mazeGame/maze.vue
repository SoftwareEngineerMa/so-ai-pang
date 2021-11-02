<template>
<div>
    <strong v-show="levelShow"  class="level">层数：{{level}} </strong>
    <shade></shade>
    <video id="video" playsinline></video>
    <maze-modal></maze-modal>
    <maze-tip></maze-tip>
    <award-hint></award-hint>
    <hxp></hxp>
    <audio ref="bgm"></audio>
    <audio ref="coin"></audio>
    <div v-show="bgmNShow" class="bgm-note">
        <span>是否要播放声音？</span>
        <br>
        <button @click="bgmN">否</button>
        <button @click="bgmY">是</button>
    </div>
    <div id="face"></div>
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
import { filter } from 'rxjs/operators';



export default {
    name: 'Maze',
    data: function() {
        return {
            level: 1,
            levelShow: false,
            bgmNShow: false,
            soundSwitch: true,
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
        boardcast 
            .pipe(filter(data => data.type === bcType.HXP_SHOW))
            .subscribe(() => {
                console.log('hxpshow');
                // 如果已经选择过否，则不会再弹出提示
                if (!this.soundSwitch) {
                    return;
                }
                this.bgmPlay().then(() => {
                    console.log('bgm播放失败！');
                    }).catch(() => {
                    this.bgmNShow = true;
                    });
            })
        boardcast
            .pipe(filter(data => data.type === bcType.HINT_SHOW))
            .subscribe(() => {
                if (this.soundSwitch) {
                    this.coinPlay();
                }
            })
        getMaze().start();
    },
    methods: {
        bgmPlay() {
            let audioPlay = this.$refs.bgm;
            audioPlay.src = '/bgm.mp3';
            return audioPlay.play();
        },

        coinPlay() {
            let coinPlay = this.$refs.coin;
            coinPlay.src = '/eat.mp3';
            coinPlay.play();
        },
        
        bgmN() {
            this.bgmNShow = false;
            this.soundSwitch = false;
        },

        bgmY() {
            this.bgmPlay();
            this.bgmNShow = false;
            this.soundSwitch = true;
        }
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
    top: 20px;
    right: 9%;
    transform: translateX(-50%);
    font-size: 1.8vw;
    z-index: 100;
    color: aliceblue;
}

#video{
    -webkit-transform: scaleX(-1);
    transform: scaleX(-1);
    width: auto;
    height: auto;
    display: none;
}

.bgm-note{
    position: absolute;
    width: 220px;
    height: 100px;
    border-radius: 10px;
    text-align: center;
    background-color: aliceblue;
    top: 50%;
    left: 50%;
    padding-top: 20px;
    transform: translate(-50%, -50%);
}

.bgm-note button {
    margin-top: 20px;
    margin: 20px;
}

#face {
    position: absolute;
    top: 0;
    left: 0;
    height: 200px;
    width: 200px;
}


</style>
