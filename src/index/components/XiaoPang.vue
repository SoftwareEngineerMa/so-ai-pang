<template>
  <div id="xiaopang">
    <Message :message="msg"/>
    <div class="xiao-pang">
      <img id="img1" :src="`./static/actions/${defaultPic}.gif`" alt="">
      <img id="img2" :src="`./static/actions/${defaultPic2}.gif`" alt="">
      <div id="eyes" @mousemove="eyeRotate" @mouseout="eyeOut"></div>
    </div>
    <div class="hide" @click="hide">
    </div>
    <div class="menu-list" v-show="showMenu">
      <ul class="list">
        <li id="li-camera" @click="openCamera"></li>
        <li id="li-game" @click="openGame"></li>
        <li id="li-doc" @click="openDoc"></li>
        <li id="li-close" @click="closeMenu"></li>
      </ul>
    </div>
    <div class="open-menu" v-show="!showMenu" @click="openMenu">
      <img src="../../assets/icons/up.png" alt="">
    </div>
    <video id="video" playsinline style="display: none;">
    </video>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import Message from './Message.vue'
// AI识别
import setupCamera from '../../utils/setCamera';
import detectHand from '../../utils/handdetect';
// import detectExpression from '../../utils/emotiondetect';
// 文案
import gestureJson from '../../assets/json/gesture';
import dateJson from '../../assets/json/date.json'
import randomJson from '../../assets/json/random.json'
// import expressionJson from '../../assets/json/expression.json'

export default {
  name: "XiaoPang",
  data() {
    return {
      defaultPic: 'think',
      defaultPic2: 'think',
      random_time: [11, 15, 16, 18],  // 出随机文案的时间节点
      emotionList: [
        { name: 'happy', value: 0 },
        { name: 'sad', value: 0 },
        { name: 'angry', value: 0 },
        { name: 'surprised', value: 0 },
        { name: 'disgusted', value: 0 },
        { name: 'fearful', value: 0 }
      ],
      emotionTime: 17,
      showMenu: false,
      msg: ['', 0],
      action: ['hi', '你好呀，我是黄小胖~', 0],

      dateJson,
      randomJson,
      gestureJson,
      // expressionJson,

      activeTime: null,
      handPose: '',
      img1: null,
      img2: null,
      eyes: null,
      eyeCenter: {x: 88, y: 68},
      eyePosMap: new Map([
        [1, {x: 0, y: 0}],
        [2, {x: -174,y: 0}],
        [3, {x: -348, y: 0}],
        [4, {x: -522, y: 0}],
        [5, {x: -696, y: 0}],
        [6, {x: 0, y: -278}],
        [7, {x: -174, y: -278}],
        [8, {x: -348, y: -278}],
        [9, {x: -522, y: -278}],
        [10,{x: -696, y: -278}],
        [11,{x: 0, y:-556}],
        [12,{x: -174, y:-556}],
        [13, {x: -348, y: -556}]
      ]),

      year: null,
      month: null,
      day: null,
      date: null,
      week: null,
      today: null,
      hour: null,
      minute: null,
      second: null,
      
      hm: 0,
      predictionHand: null,
      gestureTotal: null,

      inGame: false,
      inCamera: false,
      inDoc: false,
      mediaStreamTrack: null,
      video: null
    }
  },
  components: { Message },
  async mounted() {
    const _this = this
    ipcRenderer.on('closedGame', () => {
      _this.inGame = false
      console.log('退出游戏')
    })
    ipcRenderer.on('openCamera', () => {
      // if(stream && !this.inCamera) {
      //   this.mediaStreamTrack = stream
      //   this.inCamera = true
      // }
    })

    this.video = document.getElementById('video')
    await this.openCamera()
    
    detectHand(this.video).then((res) => {
      this.predictionHand = res
      console.log('hand detect ready')
    }).catch(
      console.log('hand detect fail')
    )
    this.closeMenu()
      
    this.init()
    requestAnimationFrame(this.loop)
  },
  methods: {
    hide() {
      ipcRenderer.send("window-min");
    },
    show() {
      ipcRenderer.send("window-show");
    },
    openMenu() {
      this.showMenu = true;
    },
    async openCamera() {
      if(this.inCamera) {
        this.mediaStreamTrack.stop();
        this.inCamera = false
      } else {
        const result = await setupCamera(this.video)
        if(result) {
          this.mediaStreamTrack = result
          this.inCamera = true
          console.log('camera ready')
        } else {
          this.inCamera = false
          console.log('camera fail')
        }
      }      
      this.closeMenu()
    },
    openGame() {
      console.log("进入游戏")
      this.inGame = true
      // window.open('/maze.html')
      ipcRenderer.send("maze-open")
      this.closeMenu()
    },
    openDoc() {
      console.log("新手引导");
      this.inDoc = true
    },
    closeMenu() {
      this.showMenu = !this.showMenu;
    },
    init() {
      this.img1 = document.getElementById('img1')
      this.img2 = document.getElementById('img2')
      this.eyes = document.getElementById('eyes')
      this.initGesture()
    },
    initGesture() {
      this.gestureTotal = {
        'victory': 0,
        'zhan': 0,
        'great': 0,
        'fist': 0,
        'point': 0,
        'ok': 0,
        'shoot': 0
      }
    },
    getGesture() {
      const item = Object.entries(this.gestureTotal).reduce((a, b) => {
        if(a[1] > b[1]) {
          return a
        }
        return b
      })
      if(item[1] > 2 ) {
        console.log(this.gestureTotal)
        console.log('最多的是：', item)
      }
      
      return item[1] > 2 ? item[0] : 'normal'
    },
    loop() {
      const DATE = new Date()
      this.year = DATE.getFullYear()  //  年
      this.month = DATE.getMonth() + 1  // 月
      this.day = DATE.getDate()         // 日
      this.week = DATE.getDay()     // 周几
      this.hour = DATE.getHours()    //  时
      this.minute = DATE.getMinutes()  //  分
      this.second = DATE.getSeconds() // 秒

      this.date = this.year + '-' + this.month + '-' +  this.day    // 2021-10-20
      this.today = this.week > 0 && this.week < 6 ? 'workdays' : 'weekends' // 工作日or周末
      
      this.hm = Number(this.fillZero(this.hour) + '' + this.fillZero(this.minute))

      if((this.hm < 1240 || this.hm > 1400) && !this.inGame && this.inCamera) {
        this.addGesture()
      }
      requestAnimationFrame(this.loop)
    },
    fillZero(num) {
      const numStr = '0' + num
      const r = numStr.slice(-2)
      return r
    },
    addGesture() {
      if(this.video && this.predictionHand) {
        this.predictionHand()?.then(res => {
          if(res !== 'normal') {
            this.gestureTotal[res] = this.gestureTotal[res] + 1
          }
        });
      }
    },
    initDefault() {
      if(this.today === 'workdays') {
        if((this.hm >= 1000 && this.hm < 1240) || (this.hm >= 1400 && this.hm < 1900)) {
          this.defaultPic = 'work'
        } else if (this.hm >= 1240 && this.hm < 1400) {
          this.defaultPic = 'zzz'  
        } else {
          this.defaultPic = 'think' 
        }
      } else {
        this.defaultPic = 'think'  
      }
    },

    // 根据正切值求角度
    getTanDeg(tan) {
      return Math.round(Math.atan(tan) / (Math.PI / 180));
    },

    // 眼球转动逻辑
    eyesMoveHandle(ev) {
      let offX = ev.offsetX - this.eyeCenter.x;
      let offY = ev.offsetY - this.eyeCenter.y;
      const tan = Math.abs(offX) / Math.abs(offY);
      const angle = this.getTanDeg(tan);
      if (offX < 0) {
          if (offY < 0) {
              console.log('第二象限');
              if (angle < 15) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(1).x}px ${this.eyePosMap.get(1).y}px`;
              } else if (angle < 30) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(2).x}px ${this.eyePosMap.get(2).y}px`;
              } else if (angle < 45) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(3).x}px ${this.eyePosMap.get(3).y}px`;
              } else if (angle < 60) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(4).x}px ${this.eyePosMap.get(4).y}px`;
              } else {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(5).x}px ${this.eyePosMap.get(5).y}px`;
              }
          } else {
              console.log('第三象限');
              if (angle < 30) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(7).x}px ${this.eyePosMap.get(7).y}px`;
              } else if (angle < 60) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(6).x}px ${this.eyePosMap.get(6).y}px`;
              } else {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(5).x}px ${this.eyePosMap.get(5).y}px`;
              }
          }
      } else {
          if (offY < 0){
              console.log('第一象限');
              if (angle < 15) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(1).x}px ${this.eyePosMap.get(1).y}px`;
              } else if (angle < 30) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(13).x}px ${this.eyePosMap.get(13).y}px`;
              } else if (angle < 45) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(12).x}px ${this.eyePosMap.get(12).y}px`;
              } else {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(11).x}px ${this.eyePosMap.get(11).y}px`;
              }

          } else {
              console.log('第四象限');
              if (angle < 15) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(7).x}px ${this.eyePosMap.get(7).y}px`;
              } else if (angle < 30) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(8).x}px ${this.eyePosMap.get(8).y}px`;
              } else if (angle < 45) {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(9).x}px ${this.eyePosMap.get(9).y}px`;
              } else {
                  this.eyes.style.backgroundPosition = `${this.eyePosMap.get(10).x}px ${this.eyePosMap.get(10).y}px`;
              }
          }
      }
    },

    eyeRotate(ev) {
      this.img1.style.display = 'none';
      this.img2.style.display = 'none';
      this.eyes.style.opacity = '1';
      this.eyesMoveHandle(ev);
    },

    eyeOut() {
      this.eyes.style.opacity = '0';
      this.img1.style.display = 'block';
      this.img2.style.display = 'block';
    }
  },
  watch: {
    inCamera: function(val) {
      if(val) {
        document.getElementById('li-camera').style.backgroundImage = "url('./static/icons/camera-h.png')"
      } else {
        document.getElementById('li-camera').style.backgroundImage = "url('./static/icons/camera.png')"
      }
    },
    inGame: function(val) {
      if(val) {
        document.getElementById('li-game').style.backgroundImage = "url('./static/icons/game-h.png')"
      } else {
        document.getElementById('li-game').style.backgroundImage = "url('./static/icons/game.png')"
      }
    },
    inDoc: function(val) {
      if(val) {
        document.getElementById('li-doc').style.backgroundImage = "url('./static/assets/icons/doc-h.png')"
      } else {
        document.getElementById('li-doc').style.backgroundImage = "url('./static/assets/icons/doc.png')"
      }
    },
    today: function() {
    },
    hour: function() {
      // 整点动作
      let time = this.hour + ':' + '00' + ':' + '00'
      if(this.random_time.indexOf(Number(this.hour)) > -1) {
        // 出自random
        let index = Math.floor(Math.random() * this.randomJson.data.length)
        this.action = this.randomJson.data[index]
      } else if (this.dateJson[this.today][this.date]) {
        // 出自date
        if(this.today == 'workdays' && this.dateJson[this.today][this.date][time]) {
          this.action = this.dateJson[this.today][this.date][time]
        }else if(this.today == 'weekends' && this.dateJson[this.today][time]) {
          this.action = this.dateJson[this.today][time]
        }
      } 
      
      // else if (this.hour === this.emotionTime) {
      //   const emotion = (this.emotionList.reduce((maxItem, item) => item.value > maxItem ? item : maxItem)).name
      //   this.action = expressionJson[emotion][Math.floor(Math.random() * expressionJson[emotion].length)]
      // }
    },
    minute: function() {
      // 非整点 午睡动作
      if(this.today == 'workdays' && this.hm == 1240) {
        let time = '12:40:00'
        this.action = this.dateJson[this.today][this.date][time]
      }
      
      // 切换默认工作
      this.initDefault()

      if(this.hm === 1240) {
        this.show()
      }
    },
    second: async function() {
      const gest = this.getGesture()
      if(gest !== 'normal') {
        this.handPose = gest
        this.initGesture()
      } 
    },
    action: {
      deep: true,
      handler: function() {
        if(this.action && this.action.action) {
          clearTimeout(this.activeTimer)
          this.action.action = this.action.action || 'think'
          this.msg = [this.action.text, this.action.duration]
          this.img2.src = `./static/actions/${this.action.action}.gif`
          this.img1.style.opacity = 0
          this.img2.style.opacity = 1
          this.activeTimer = setTimeout(() => {
            if (this.hm === 1200) {
              this.hide()
              return
            }
            this.img1.style.opacity = 1
            this.img2.style.opacity = 0
            this.action = []
          }, this.action.duration * 1000)
        }
    }},
    handPose: function(val) {
      if(this.handPose !== 'normal') {
        const gestureList = gestureJson[val]
        if(gestureList) {
          this.action = gestureList[Math.floor(Math.random() * gestureList.length)]
        }
      }
      
      this.handPose = 'normal'
    }
  }
};

</script>

<style>
* {
  margin: 0;
  padding: 0;
}
#xiaopang {
  width: 283px;
  height: 283px;
  position: relative;
  cursor: pointer;
  -webkit-app-region: drag;
  /* border: 1px solid red; */
}
.xiao-pang {
  width: 283px;
  height: 283px;
  opacity: 1;
  /* border: 1px solid red; */

}
.xiao-pang > img {
  width: 283px;
  height: 283px;
  /* transition: opacity 1s; */
  /* border: 1px solid red; */
}
.xiao-pang #img1 {
  opacity: 1;
}
.xiao-pang #img2 {
  position: absolute;
  top: 0px;
  left: 0px;
  opacity: 0;
}
/* 菜单 */
.hide, .menu-list, .open-menu {
  position: absolute;
}
.hide {
  top: 60px;
  right: 30px;
  width: 30px;
  height: 30px;
  background-image: url('../../assets/icons/min.png');
  background-size: 100%;
  -webkit-app-region: no-drag;
}

.hide:hover {
  background-image: url('../../assets/icons/min-h.png') !important;
}
.open-menu {
  bottom: 25px;
  right: 15px;
  -webkit-app-region: no-drag;
}
.open-menu > img {
  width: 48px;
  height: 48px;
}
.menu-list {
  bottom: 20px;
  right: 0;
  height: 180px;
  width: 65px;
}
.list {
  height: 180px;
  width: 65px;
  background-image: url('../../assets/icons/menu-list.png');
  background-size: 65px 180px;
  background-repeat: no-repeat;
  position: relative;
  padding: 6px 6px;
}
.list > li {
  list-style: none;
  width: 32px;
  height: 32px;
  background-size: 32px 32px;
  position: relative;
  -webkit-app-region: no-drag;
}
#li-camera {
  background-image: url('../../assets/icons/camera.png');
  margin-top: 4px;
  margin-left: 4px;
}
#li-game {
  background-image: url('../../assets/icons/game.png');
  margin-top: 8px;
  margin-left: 15px;
}
#li-doc {
  background-image: url('../../assets/icons/doc.png');
  margin-top: 8px;
  margin-left: 16px;
}
#li-close {
  background-image: url('../../assets/icons/close.png');
  margin-top: 8px;
  margin-left: 6px;
}
#li-camera:hover {
  background-image: url('../../assets/icons/camera-h.png') !important;
}
#li-game:hover {
  background-image: url('../../assets/icons/game-h.png') !important;
}
#li-doc:hover {
  background-image: url('../../assets/icons/doc-h.png') !important;
}
#li-close:hover {
  background-image: url('../../assets/icons/close-h.png') !important;
}

#eyes {
  position: absolute;
  opacity: 0;
  background-image: url('../../assets/eye/eye.png');
  background-size: 500% 300%;
  top: 0;
  left:50%;
  transform: translateX(-50%);
  width: 174px;
  height: 278px;
}

</style>