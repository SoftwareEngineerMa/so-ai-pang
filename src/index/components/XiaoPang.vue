<template>
  <div id="xiaopang">
    <Message :message="message"/>
    <div class="xiao-pang">
      <img id="img1" src="../../assets/images/enen.gif" alt="">
      <img id="img2" src="../../assets/images/heart2.gif" alt="">
    </div>
    <div class="menu">
      <div class="hide">
        <img src="../../assets/images/min-h.png" alt="" @click="hide">
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
        <img src="../../assets/images/up.png" alt="">
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import Message from './Message.vue'
import dateJson from '../../assets/json/date.json'
import randomJson from '../../assets/json/random.json'
export default {
  name: "XiaoPang",
  data() {
    return {
      showMenu: false,
      message: ['哈喽呀，今天也是元气满满的一天呢！',5],
      // message: ['嘘，我刚刚听我的leader也就是你的leader的黄小胖说你的leader夸你有点优秀，不知道你听懂了没有？',5],
      dateJson,
      randomJson
    }
  },
  components: { Message },
  methods: {
    hide() {
      ipcRenderer.send("window-min");
    },
    openMenu() {
      this.showMenu = true;
    },
    openCamera() {
      console.log("AI运动");
    },
    openGame() {
      console.log("进入游戏");
      window.open('/maze.html')
    },
    openDoc() {
      console.log("新手引导");
    },
    closeMenu() {
      this.showMenu = !this.showMenu;
    },
    initMessage() {
      let date = new Date()
      let this_year = date.getFullYear()  //  年
      let this_month = date.getMonth() + 1  // 月
      let this_day = date.getDate()         // 日
      let this_date = this_year.toString() + '-' + this_month + '-' + this_day    // 2021-10-20
      let this_week = date.getDay()     // 周
      let today = this_week > 0 && this_week < 6 ? 'workdays' : 'weekends' // 工作日or周末
      let this_h = date.getHours()    //  时
      let this_m = date.getMinutes()  //  分
      let random_time = [11, 14, 15, 16, 17, 18]  // 出随机文案的时间节点
      let msg = []
      let img1 = document.getElementById('img1')
      let img2 = document.getElementById('img2')
      if(today == 'workdays') {
        // img1.src = require('../assets/images/work.gif')
        img1.src = require('../../assets/images/enen.gif')
      }
      setInterval(() => {
        let sleep = Number(this_h + '' + this_m)
        this_m = this_m + 1
        if(this_m == 60) {
          this_h++
          this_m = 0
        }
        if(sleep > 1239 && sleep < 1400) {
          if(sleep == 1240) {
            let time = '12:40:00'
            msg = today == 'workdays' ? this.dateJson[today][this_date][time] : msg = this.dateJson[today][time]
          }
        } else if (this_m == 0) { //  整点
          let time = this_h + ':' + '00' + ':' + '00'
          if(random_time.indexOf(Number(this_h)) > -1) {  //  出random
            let index = parseInt(Math.random() * 98)
            msg = this.randomJson.date[index]
          } else {  //  出date
            msg = today == 'workdays' ? this.dateJson[today][this_date][time] : msg = this.dateJson[today][time]
          }
        }
        msg.action = msg.action || 'enen'
        this.message = [msg.text, msg.duration]
        img2.src = require(`../../assets/images/${msg.action}.gif`)
        img1.style.opacity = 0
        img2.style.opacity = 1
        setTimeout(() => {
          img1.style.opacity = 1
          img2.style.opacity = 0
        }, msg.duration * 1000)
      }, 60000)
    }
  },
  mounted() {
    this.initMessage()
    // setTimeout(() => {
    //   let aa = 'drink'
    //   let img1 = document.getElementById('img1')
    //   let img2 = document.getElementById('img2')
    //   this.message=['喝水时间到！快端起手边的水杯补充一下水分吧！', 5]
    //   img2.src = require(`../assets/images/${aa}.gif`)
    //   img1.style.opacity = 0
    //   img2.style.opacity = 1
    //   setTimeout(() => {
    //     img1.style.opacity = 1
    //     img2.style.opacity = 0
    //   }, 5000)
    // }, 8000)
  },
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
  /* background: url('../assets/images/menu-list.png'); */
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
  background: url('../../assets/images/camera-h.png');
  /* background-position: -14px -10px; */
}
.li-game {
  background: url('../../assets/images/game-h.png');
  /* background-position: -5px -10px; */
}
.li-doc {
  background: url('../../assets/images/doc-h.png');
  /* background-position: -5px -10px; */
}
.li-close {
  background: url('../../assets/images/close-h.png');
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