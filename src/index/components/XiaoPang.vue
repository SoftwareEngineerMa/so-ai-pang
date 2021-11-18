<template>
  <div id="xiaopang">
    <Message :message="msg"/>
    <div class="wrap">
      <div class="xiao-pang">
        <img id="img1" :src="`./static/actions/${defaultPic}.gif`" alt="">
        <!-- <img id="img2" :src="`./static/actions/${defaultPic2}.gif`" alt=""> -->
      </div>
      <div class="hide" @click="hide">
      </div>
      <div class="menu-wrap" @mouseleave="hideMenu">
        <div class="menu-list" v-show="showMenu">
          <ul class="list">
            <li id="li-camera" @click="openCamera" title="摄像头"></li>
            <li id="li-game" @click="openGame" title="游戏"></li>
            <li id="li-doc" @click="openDoc" title="新手引导"></li>
            <li id="li-close" @click="closeMenu"></li>
          </ul>
        </div>
        <div class="open-menu" v-show="!showMenu" @click="openMenu">
          <img src="../../../public/static/icons/up.png" alt="">
        </div>
      </div>
    </div>
    <video id="video" playsinline style="display: none;">
    </video>
    <Confirm v-if="confirmShow" :text="confirmText" @cancel-click="confirmCancel" @ok-click="confirmOK"></Confirm>
    <Alert v-if="alertShow" :text="alertText" @ok-click="alertOK"></Alert>
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
// import Vue from 'vue'

import Confirm from './confirm.vue'
import Alert from './alert.vue'

export default {
  name: "XiaoPang",
  data() {
    return {
      defaultPic: 'think',
      // defaultPic2: 'think',
      random_time: ['11:00:00', '15:00:00', '16:00:00', '18:00:00'],  // 出随机文案的时间节点
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
      // img2: null,

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
      video: null,

      dayJsonList: [],
      dayTimeIndex: 0,
      lastIndex: null,

      handPoseList: ['ok', 'shoot', 'great', 'victory', 'zhan'],
      handPoseIndex: 0,
      confirmText: '',
      confirmShow: false,
      alertText: '',
      alertShow: false,
    }
  },
  components: { Message, Confirm, Alert },

  async mounted() {
    // 初始化
    this.init()
    setInterval(() => {
      this.loop();
    }, 100)
    
    // 摄像头引导
    this.confirm('将开启摄像头，体验手势交互？（360承诺您，您的数据将始终保存在本地，不存在数据泄露问题）', () => {
      this.openCamera()
      this.confirmShow = false
    }, () => {
      this.confirmShow = false
    })

    // 新手引导
    this.openDoc()

    // 模型加载
    detectHand().then((res) => {
      this.predictionHand = res
      console.log('hand detect ready')
    }).catch(
      console.log('hand detect fail')
    )
  },
  methods: {
    initQuickKey() {
      const DATE = new Date()
      this.date = DATE.getFullYear() + '-' + this.fillZero(DATE.getMonth() + 1) + '-' +  this.fillZero(DATE.getDate())    // 2021-10-20
      this.today = DATE.getDay() > 0 && DATE.getDay() < 6 ? 'workdays' : 'weekends' // 工作日or周末
      console.log('this.date:', this.date)
      if(this.today === 'workdays') {
        this.dayJsonList = Object.values(this.dateJson[this.today][this.date])
    
        const _this = this
        document.addEventListener('keydown', (e) => {
          // 快捷键H 设置了循环播放一天的交互动作
          if(e.code === 'KeyH' && _this.dayJsonList) {
            _this.action = _this.dayJsonList[_this.dayTimeIndex++]
            if(_this.dayTimeIndex >= _this.dayJsonList.length) {
              _this.dayTimeIndex = 0
            }
          }
          // 快捷键X 设置了循环播放一天的交互动作，展示用
          if(e.code === 'KeyX' && _this.randomJson) {
            let index = null
            while(!index || index === this.lastIndex) {
              index = Math.floor(Math.random() * this.randomJson.data.length)
            }
            this.lastIndex = index
            this.action = this.randomJson.data[index]
          }
          // 快捷键P 设置了手势动作，展示用
          if(e.code === 'KeyP' && _this.randomJson) {
            this.handPose = this.handPoseList[this.handPoseIndex++]
            if(this.handPoseIndex >= this.handPoseList.length) {
              this.handPoseIndex = 0
            }
          }
        })
      }
    },
    hide() {
      ipcRenderer.send("window-min");
    },
    show() {
      ipcRenderer.send("window-show");
    },
    openMenu() {
      this.showMenu = true;
    },
    hideMenu() {
      this.showMenu = false;
    },
    async openCamera() {
      if(this.inCamera) {
        if(this.inGame) {
          ipcRenderer.send('closeGameCamera')
        }
        this.mediaStreamTrack.stop();
        this.inCamera = false
        this.myAlert("摄像头已关闭，需要时，可在菜单中主动开启摄像头", () => {
          this.alertShow = false;
        })
        
      } else {
        const result = await setupCamera(this.video)
        if(result) {
          if(this.inGame) {
            ipcRenderer.send('openGameCamera')
          }
          this.mediaStreamTrack = result
          this.inCamera = true
          this.myAlert("摄像头已开启，可在菜单中控制摄像头的开关", () => {
            this.alertShow = false;
          })
          console.log('camera ready')
        } else {
          this.inCamera = false
          this.myAlert("摄像头开启失败", () => {
            this.alertShow = false;
          })
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
      this.inDoc = true;
      ipcRenderer.send("guide-open")
      ipcRenderer.on("closedGuide", () => {
        this.inDoc = false;
      })
      this.closeMenu()
    },
    closeMenu() {
      this.showMenu = !this.showMenu;
    },
    init() {
      this.img1 = document.getElementById('img1')
      // this.img2 = document.getElementById('img2')
      this.eyes = document.getElementById('eyes')
      this.initGesture()
      // 快捷键
      this.initQuickKey()
      this.video = document.getElementById('video')

      // 通信
      const _this = this
      ipcRenderer.on('closedGame', () => {
        _this.inGame = false
        console.log('退出游戏')
      })
      ipcRenderer.on('gameHasOpenCamera', () => {
        if(!this.inCamera) {
          this.openCamera()
        }
      })
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
      // requestAnimationFrame(this.loop)
    },
    fillZero(num) {
      const numStr = '0' + num
      const r = numStr.slice(-2)
      return r
    },
    addGesture() {
      if(this.video && this.predictionHand) {
        this.predictionHand(this.video)?.then(res => {
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
    hourAction(hour) {
      let time = hour ? hour:this.hour + ':' + '00' + ':' + '00'
      if(this.random_time.indexOf(time) > -1) {
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
    },
    confirm(text, ok, cancel ) {
      this.confirmShow = true;
      this.confirmText = text;
      this.confirmCancel = cancel;
      this.confirmOK = ok;
    },
    myAlert(text, ok) {
      this.alertShow = true;
      this.alertText = text;
      this.alertOK = ok;
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
        document.getElementById('li-doc').style.backgroundImage = "url('./static/icons/doc-h.png')"
      } else {
        document.getElementById('li-doc').style.backgroundImage = "url('./static/icons/doc.png')"
      }
    },
    today: function() {
    },
    hour: function() {
      // 整点动作
      this.hourAction()
      
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
      if(this.second % 2 === 0) {
        const gest = this.getGesture()
        if(gest !== 'normal') {
          this.handPose = gest
          this.initGesture()
        } 
      }
    },
    action: {
      deep: true,
      immediate: true,
      handler: function() {
        if(this.action && this.action.action) {
          clearTimeout(this.activeTimer)
          this.action.action = this.action.action || 'think'
          this.img1.src = `./static/actions/${this.action.action}.gif`
          // 图片加载需要时间，不用onload的话，文本和图片显示有时间差
          this.img1.onload = () => {
            this.msg = [this.action.text, this.action.duration];
            // this.img1.style.display = 'none'
            // this.img2.style.display = 'block'
            this.activeTimer = setTimeout(() => {
              if (this.hm === 1200) {
                this.hide()
                return
              }
              // this.img1.style.display = 'block'
              // this.img2.style.display = 'none'
              this.img1.src = `./static/actions/${this.defaultPic}.gif`
              this.msg = []
              this.action = []
            }, this.action.duration * 1000)

            this.img1.onload = null
          }
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
  /* width: 283px;
  height: 283px; */
  width: 250px;
  height: 250px;
  cursor: pointer;
  position: relative;
  -webkit-app-region: drag;
  /* border: 1px solid red; */
}
.wrap {
  width: 200px;
  height: 200px;
  margin: 50px 0 0 50px;
  position: relative;
}
.xiao-pang {
  opacity: 1;
  /* width: 283px;
  height: 283px; */
  width: 200px;
  height: 200px;
  /* border: 1px solid red; */

}
.xiao-pang > img {
  /* width: 283px;
  height: 283px; */
  width: 200px;
  height: 200px;
  /* transition: opacity 1s; */
  /* border: 1px solid red; */
}

/* 菜单 */
.hide, .menu-list, .open-menu {
  position: absolute;
}
.hide {
  /* top: 60px;
  right: 30px;
  width: 30px;
  height: 30px; */
  top: 40px;
  right: 20px;
  width: 20px;
  height: 20px;
  background-image: url('../../../public/static/icons/min.png');
  background-size: 100%;
  -webkit-app-region: no-drag;
}

.hide:hover {
  background-image: url('../../../public/static/icons/min-h.png') !important;
}
.menu-wrap {
  position: absolute;
  width: 40px;
  height: 115px;
  bottom: 20px;
  right: 0px;
  /* border: 1px solid red; */
  -webkit-app-region: no-drag;
}
.open-menu {
  /* bottom: 25px;
  right: 15px; */
  bottom: 0px;
  right: 10px;
  /* -webkit-app-region: no-drag; */
}
.open-menu > img {
  /* width: 48px;
  height: 48px; */
  width: 30px;
  height: 30px;
}
.menu-list {
  /* bottom: 20px;
  right: 0;
  height: 180px;
  width: 65px; */
  bottom: -3px;
  right: 0px;
  height: 120px;
  width: 42px;
}
.list {
  position: relative;
  background-image: url('../../../public/static/icons/menu-list.png');
  background-repeat: no-repeat;
  /* background-size: 65px 180px;
  height: 180px;
  width: 65px;
  padding: 6px 6px; */
  background-size: 42px 120px;
  height: 120px;
  width: 42px;
  padding: 4px 4px;
}
.list > li {
  list-style: none;
  position: relative;
  -webkit-app-region: no-drag;
  /* width: 32px;
  height: 32px;
  background-size: 32px 32px; */
  width: 21px;
  height: 21px;
  background-size: 21px 21px;
}
#li-camera {
  background-image: url('../../../public/static/icons/camera.png');
  /* margin-top: 4px;
  margin-left: 4px; */
  margin-top: 2px;
  margin-left: 2px;
}
#li-game {
  background-image: url('../../../public/static/icons/game.png');
  /* margin-top: 8px;
  margin-left: 15px; */
  margin-top: 7px;
  margin-left: 10px;
}
#li-doc {
  background-image: url('../../../public/static/icons/doc.png');
  /* margin-top: 8px;
  margin-left: 16px; */
  margin-top: 8px;
  margin-left: 10px;
}
#li-close {
  background-image: url('../../../public/static/icons/close.png');
  /* margin-top: 8px;
  margin-left: 6px; */
  margin-top: 7px;
  margin-left: 2px;
}
#li-camera:hover {
  background-image: url('../../../public/static/icons/camera-h.png') !important;
}
#li-game:hover {
  background-image: url('../../../public/static/icons/game-h.png') !important;
}
#li-doc:hover {
  background-image: url('../../../public/static/icons/doc-h.png') !important;
}
#li-close:hover {
  background-image: url('../../../public/static/icons/close-h.png') !important;
}
</style>