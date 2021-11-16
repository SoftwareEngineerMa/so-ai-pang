<template>
    <div v-show="show" class="shade" :style="{ width: width, height: height }">
      <strong v-show="!in_show">加载中...</strong>
      <div class="intro" v-show="in_show">
          <div class="text-container">
              <p class="text-title">求助～求助～</p>
              <p class="p_1">我在360星球迷路了，快帮助我走出迷宫吧！</p>
              <p class="p_2">请<span> 正对摄像头 </span>,使头部在摄像头可视范围内</p>
              <p class="p_2">确保屏幕左上角实时显示头部信息。</p>
              <p class="p_2">请保持<span> 身体不动 </span>，</p>
              <p class="p_2">通过<span> 仰头/低头/向左歪头/向右歪头 </span></p>
              <p class="p_2">来指引小胖走出迷宫吧！</p>
          </div>
          <div class="maze-btn">
              <div v-if="!has_record" class="btn" :has_record="has_record" @click="startNew">开始游戏</div>
              <div v-if="has_record" class="btn" :has_record="has_record" @click="startNew">重新开始</div>
              <div v-if="has_record" class="btn" :has_record="has_record" @click="startRecord">继续游戏</div>
              <div class="btn" :has_record="has_record" @click="quit">退出</div>
          </div>
      </div>
      <div v-show="!in_show" class="loading" :style="{backgroundPosition: '0 ' + loading_pos + '%'}"></div>
    </div>
</template>


<script>
import { bcType, boardcast } from '../subject';
import { delay, filter } from 'rxjs/operators';

import { ipcRenderer } from "electron";

const fs = require('fs');
const path = require('path');

export default {
    name: 'Shade',
    data: function(){
        return {
            show: true,
            width: 0,
            height: 0,
            in_show: false,
            loading_pos: 0,
            mazeJson: {},
        }
    },
    computed: {
        has_record() {
            return Object.keys(this.mazeJson).length !== 0;
        },
    },
    mounted: function() {
        let d = fs.readFileSync(path.join(__dirname,'../app/json/maze.json'));
        this.mazeJson = JSON.parse(d.toString());
        this.onResize();

        boardcast
            .pipe(filter(data => data.type === bcType.MAZE_LOADING))
            .subscribe(() => {
                this.loading_pos += 20;
            })

        // 延迟300ms 使加载的效果更佳明显
        boardcast
        .pipe(filter(data => data.type === bcType.MAZE_LOADED), delay(300)) 
        .subscribe(() => {
            this.in_show = true;
        })

        boardcast
            .pipe(filter(data => data.type === bcType.SHADE_SHOW))
            .subscribe(() => {
                this.show = true;
            })
        boardcast
            .pipe(filter(data => data.type === bcType.SHADE_HIDE))
            .subscribe(() => {
                this.show = false;
            })
        window.onresize = this.onResize;
    },
    methods: {
        onResize() {
            this.width = window.innerWidth + 'px';
            this.height = window.innerHeight + 'px';
        },

        startNew() {
            boardcast.next({ type:bcType.HXP_REVIVE });
        },

        startRecord() {
            boardcast.next({ type:bcType.HXP_REVIVE, value: this.mazeJson });
            boardcast.next({ type:bcType.MAZE_LEVEL, value: Object.keys(this.mazeJson)[0] })
        },

        quit() {
            ipcRenderer.send('maze-close');
        }
    }
}
</script>

<style scoped>

.shade{
    background-image: url('../../../public/texture/concrete.png');
    background-size:contain;
}

.shade strong{
    display: block;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translateX(-50%) ;
    font-size: 2vw;
    color: aliceblue;
}
.intro {
    position: absolute;
    width: 60%;
    height: 0;
    padding-bottom: 49.8%;
    text-align: center;
    background-image: url('../../../public/img/maze_intro_.png');
    background-size: cover;
    top: 50%;
    left: 50%;
    z-index: 100;
    transform: translate(-50%, -50%);
    
}

.text-container {
    width: 100%;
    height: 100%;
    text-align: center;
}

.text-title {
    margin-top: 15%;
    margin-bottom: 1.5vw;
    color: #474137;
    font-size: 3vw;
    font-weight: bolder;
}

.p_1 {
    font-size: 2vw;
    color: #8a867c;
    margin: 1vw 0;
}

.p_2 {
    font-size: 1.6vw;
    color: #8a867c;
    margin: 0.8vw 0;
}

.p_2 span{
    background-color: #ffd52c;
}

.maze-btn {
    position: absolute;
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
    height: 22%;
    bottom: 0;
}

.btn {
    margin: 2vw 3vw;
    width: 13vw;
    height: 3.6vw;
    line-height: 3.6vw;
    border-radius: 1.8vw;
    background-color: #ffd52c;
    color: #474137;
    cursor: pointer;
}

.btn[has_record="true"] {
    margin: 2vw 1.5vw;
}

.loading {
    position: absolute;
    width: 50%;
    height: 0;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding-bottom: 4.3%;
    /* border-radius: 20px; */
    background-image: url('../../../public/loading.png');
    background-position-y: 0%;
    background-size: cover;
    z-index: 10;
}

.close {
    position: absolute;
    right: 0;
    width: 30px;
    height: 30px;
    background-image: url('../../../public/img/close.png');
    background-size: cover;
    cursor: pointer;
}

</style>
