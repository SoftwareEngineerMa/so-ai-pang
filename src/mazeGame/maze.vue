<template>
<div>
    <shade></shade>
    <video id="video" playsinline></video>
    <maze-modal></maze-modal>
    <maze-tip></maze-tip>
    <award-hint></award-hint>
    <hxp></hxp>
    <audio ref="bgm"></audio>
    <audio ref="coin"></audio>
    <audio ref="footstep"></audio>
    <div v-show="bgmNShow" class="bgm-note">
        <span>是否要播放声音？</span>
        <br>
        <button @click="bgmN">否</button>
        <button @click="bgmY">是</button>
    </div>
    <div id="face" ref="face"></div>
    <div id="sound" ref="sound" @click="() => this.soundSwitch = !this.soundSwitch"></div>
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

        this.$refs.sound.style.backgroundImage = "url('/img/sound-on.png')";

        window.addEventListener('resize', () => {
            if ( window.innerHeight * 0.2 < 110 ) {
                this.$refs.face.style.display = 'none';
                return;
            } else {
                
                this.$refs.face.style.display = 'block';
                
            }
            this.onResize();
        })
        boardcast 
            .pipe(filter(data => data.type === bcType.HXP_SHOW))
            .subscribe(() => {
                console.log('hxp show');
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
        onResize() {
            const w = window.innerHeight * 0.2;
            this.$refs.face.style.width = w + 'px';
            this.$refs.face.style.height = w + 'px';
        },
        bgmPlay() {
            let audioPlay = this.$refs.bgm;
            audioPlay.crossOrigin = 'anonymous';
            audioPlay.src = '/bgm_.mp3';
            return audioPlay.play();
        },

        coinPlay() {
            let coinPlay = this.$refs.coin;
            coinPlay.src = '/eat.mp3';
            coinPlay.play();
        },

        footPlay() {
            let footstepPlay = this.$refs.footstep;
            footstepPlay.src = '/footstep.mp3';
            footstepPlay.play();
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
    },

    watch: {
        soundSwitch(val) {
            this.$refs.sound.style.backgroundImage = val ? "url('/img/sound-on.png')" : "url('/img/sound-off.png')";
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

#sound {
    position: absolute;
    width: 2.5vw;
    height: 2.5vw;
    top: 10px;
    left: 50%;
    background-size: 100%;
    transform: translateX(-50%);
    cursor: pointer;
}


</style>
