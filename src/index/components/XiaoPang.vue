<template>
  <div id="xiaopang">
    <Message :message="msg"/>
    <div class="xiao-pang">
      <img id="img1" :src="`./static/actions/${defaultPic}.gif`" alt="">
      <img id="img2" :src="`./static/actions/${defaultPic2}.gif`" alt="">
    </div>
    <div class="menu">
      <div class="hide">
        <img src="../../assets/icons/min-h.png" alt="" @click="hide">
      </div>
      <div class="menu-list" v-show="showMenu">
        <ul class="list">
          <li class="li-camera" @click="openCamera"></li>
          <li class="li-game" @click="openGame"></li>
          <li class="li-doc" @click="openDoc"></li>
          <li class="li-close" @click="closeMenu"></li>
        </ul>
      </div>
      <div class="open-menu" v-show="!showMenu" @click="openMenu">
        <img src="../../assets/icons/up.png" alt="">
      </div>
    </div>
    <video id="video" playsinline style="
      -webkit-transform: scaleX(-1);
      transform: scaleX(-1);
      width: auto;
      height: auto;
      display: none;
      ">
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
      defaultPic: 'enen',
      defaultPic2: 'enen',
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
      msg: ['哈喽呀，今天也是元气满满的一天呢！',5],
      // msg: ['嘘，我刚刚听我的leader也就是你的leader的黄小胖说你的leader夸你有点优秀，不知道你听懂了没有？',5],
      action: ['enen', '你好呀，我是黄小胖~', 0],
      dateJson,
      randomJson,
      gestureJson,
      // expressionJson,
      activeTime: null,
      handPose: '',
      img1: null,
      img2: null,

      year: null,
      month: null,
      day: null,
      date: null,
      week: null,
      today: null,
      hour: null,
      minute: null,
      second: null,
      
      camera: false,
      hm: 0,
      predictionHand: null,
      gestureTotal: null,
    }
  },
  components: { Message },
  async mounted() {
    await this.openCamera()
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
      if(this.camera) {
        console.log('不用重复开启摄像头')
        return
      }
      this.camera = await setupCamera(document.getElementById('video'))
      // this.predictEmotion = await detectExpression(this.video);
      console.log('camera success')
      this.predictionHand = await detectHand();
      console.log('detecthand success')
    },
    openGame() {
      console.log("进入游戏");
      window.open('/maze.html')
    },
    openDoc() {
      console.log("新手引导");
    },
    closeCamera() {
      window.mediaStreamTrack.stop();
      this.camera = false;
    },
    closeMenu() {
      this.showMenu = !this.showMenu;
    },
    init() {
      this.img1 = document.getElementById('img1')
      this.img2 = document.getElementById('img2')
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
      console.log(this.gestureTotal)
      const item = Object.entries(this.gestureTotal).reduce((a, b) => {
        if(a[1] > b[1]) {
          return a
        }
        return b
      })
      console.log('最多的是：', item)
      return item[1] > 0 ? item[0] : 'normal'
    },
    loop() {
      const DATE = new Date()
      this.year = DATE.getFullYear()  //  年
      this.month = DATE.getMonth() + 2  // 月
      this.day = DATE.getDate()         // 日
      this.week = DATE.getDay()     // 周几
      this.hour = DATE.getHours()    //  时
      this.minute = DATE.getMinutes()  //  分
      this.second = DATE.getSeconds() // 秒

      this.date = this.year + '-' + this.month + '-' +  this.day    // 2021-10-20
      this.today = this.week > 0 && this.week < 6 ? 'workdays' : 'weekends' // 工作日or周末
      this.addGesture()
      // this.hour = 12
      // this.minute = 40

      requestAnimationFrame(this.loop)
    },
    addGesture() {
      if(this.predictionHand) {
        this.predictionHand()?.then(res => {
          if(res !== 'normal') {
            this.gestureTotal[res] = this.gestureTotal[res] + 1
            console.log(res);
          }
        });
      }
    },
  },
  watch: {
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
      const fillZero = (num) => {
        const numStr = '0' + num
        const r = numStr.slice(-2)
        return r
      }
      this.hm = Number(fillZero(this.hour) + '' + fillZero(this.minute))
      // console.log(this.hm)

      // 非整点 午睡动作
      if(this.today == 'workdays' && this.hm == 1240) {
        let time = '12:40:00'
        this.action = this.dateJson[this.today][this.date][time]
      }
      
      // 切换默认工作
      if(this.today === 'workdays') {
        if((this.hm >= 1000 && this.hm < 1240) || (this.hm >= 1400 && this.hm < 1900)) {
          this.defaultPic = 'work'
        } else if (this.hm >= 1240 && this.hm < 1400) {
          this.defaultPic = 'zzz'  
        } else {
          this.defaultPic = 'enen' 
        }
      } else {
        this.defaultPic = 'enen'  
      }

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
      clearTimeout(this.activeTimer)
      this.action.action = this.action.action || 'enen'
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
      }, this.action.duration * 1000)
    }},
    handPose: function(val) {
      const gestureList = gestureJson[val]
      console.log(gestureList)
      if(gestureList) {
        this.action = gestureList[Math.floor(Math.random() * gestureList.length)]
      }
      if(val === 'zhan') {
        this.show();
      }
      if(val === 'gist') {
        this.hide();
      }
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
  width: 150px;
  height: 150px;
  position: relative;
  cursor: pointer;
  -webkit-app-region: drag;
  /* border: 1px solid red; */
}
.xiao-pang {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 150px;
  height: 150px;
  opacity: 1;
  /* border: 1px solid red; */

}
.xiao-pang > img {
  width: 150px;
  height: 150px;
  transition: opacity 3s;
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
  /* border: 1px solid red; */
}
.menu {
  width: 30px;
  height: 150px;
  position: absolute;
  bottom: 0px;
  right: 0px;
  /* right: -20px; */
  /* border: 1px solid red; */
}
.hide, .menu-list, .open-menu {
  position: absolute;
  right: 0px;
  width: 30px;
}
.hide {
  top: 7px;
  left: 0px;
  height: 25px;
  -webkit-app-region: no-drag;
}
.hide > img {
  width: 30px;
  height: 30px;
}
.menu-list {
  bottom: -10px;
  height: 125px;
  /* background: url('../assets/icons/menu-list.png'); */
  background-size: 110%;
}
.list {
  height: 125px;
}
.list > li {
  list-style: none;
  width: 28px;
  height: 28px;
  background-size: 100%;
  -webkit-app-region: no-drag;
}
.li-camera {
  background: url('../../assets/icons/camera-h.png');
  /* background-position: -14px -10px; */
}
.li-game {
  background: url('../../assets/icons/game-h.png');
  /* background-position: -5px -10px; */
}
.li-doc {
  background: url('../../assets/icons/doc-h.png');
  /* background-position: -5px -10px; */
}
.li-close {
  background: url('../../assets/icons/close-h.png');
  /* background-position: -15px -10px; */
}
/* .list > li > img {
  width: 20px;
  height: 20px;
  border: 1px solid #000;
} */
.open-menu {
  bottom: -2px;
  left: 0px;
  -webkit-app-region: no-drag;
}
.open-menu > img {
  width: 30px;
  height: 30px;
}
</style>