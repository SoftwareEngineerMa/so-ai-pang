<template>
  <div id="xiaopang">
    <Message :message="msg"/>
    <div class="xiao-pang">
      <img id="img1" :src="`./static/actions/${defaultPic}.gif`" alt="">
      <img id="img2" :src="`./static/actions/${defaultPic}.gif`" alt="">
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
// import detectHand from '../../utils/handdetect';
// import detectExpression from '../../utils/emotiondetect';
// 文案
// import gestureJson from '../../assets/json/gesture';
import dateJson from '../../assets/json/date.json'
import randomJson from '../../assets/json/random.json'
// import expressionJson from '../../assets/json/expression.json'

export default {
  name: "XiaoPang",
  data() {
    return {
      defaultPic: 'enen',
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
      // gestureJson,
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
    }
  },
  components: { Message },
  async mounted() {
    await this.openCamera()
    this.initMessage()
    // setTimeout(() => {
    //   let aa = 'drink'
    //   let img1 = document.getElementById('img1')
    //   let img2 = document.getElementById('img2')
    //   this.msg=['喝水时间到！快端起手边的水杯补充一下水分吧！', 5]
    //   img2.src = `./static/actions/${aa}.gif`
    //   img1.style.opacity = 0
    //   img2.style.opacity = 1
    //   setTimeout(() => {
    //     img1.style.opacity = 1
    //     img2.style.opacity = 0
    //   }, 5000)
    // }, 8000)
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
      // this.predictionHand = await detectHand();
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
    initMessage() {
      this.img1 = document.getElementById('img1')
      this.img2 = document.getElementById('img2')

      requestAnimationFrame(this.loop)
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
 
      requestAnimationFrame(this.loop)
    }
  },
  watch: {
    today: function() {
      if(this.today == 'workdays') {
        this.defaultPic = 'enen'
      }
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
          if(this.hour === 14) {
            this.show()
          }
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
      // this.today = 'workdays' //测试用
      // this.date = '2021-11-25' //测试用
      this.hm = Number(this.hour + '' + this.minute)
      // this.hm = 1240 //测试用
      if(this.today == 'workdays' && this.hm == this.sleep) {
        let time = '12:40:00'
        this.action = this.dateJson[this.today][this.date][time]
      }
    },
    second: async function() {
      if((this.hour >= 11 && this.hour <= 12) || (this.hour >= 14 && this.hour < 17)) {
        // console.log('到点了')
        // if(this.predictEmotion) {
        //   this.predictEmotion()?.then((res) => {
        //     var emotion = res.expression ? res.expression : 'normal';
        //     console.log(emotion)
        //     if(emotion != 'normal'){
        //       this.emotionList.forEach(item => {
        //         if(item.name === emotion) {
        //           item.value = item.value++
        //         }
        //       })
        //     }
        //   })
        // }
      }
      // console.log("predict hand", this.predictionHand)
      // if(this.predictionHand) {
      //   this.predictionHand()?.then(res => {
      //     this.handPose = res;
      //   });
      // }
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
        if(this.hm === 1000) {
          this.defaultPic = 'work'
        } else if (this.hm === 1200) {
          this.hide()
          return
        } else if (this.hm === 1240) {
          this.defaultPic = 'zzz'
        } else if (this.hm === 1400) {
          this.defaultPic = 'work'
        } else if (this.hour === 1900) {
          this.defaultPic = 'enen'
        }
        this.img1.style.opacity = 1
        this.img2.style.opacity = 0
      }, this.action.duration * 1000)
    }},
    // handPose: function(val) {
    //   const gestureList = gestureJson[val]
    //   this.action = gestureList[Math.floor(Math.random() * gestureList.length)]
    // }
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