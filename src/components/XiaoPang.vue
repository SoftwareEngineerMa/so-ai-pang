<template>
  <div id="xiaopang">
    <div class="xiao-pang" @click="touchXp"></div>
    <div class="menu">
      <div class="hide">
        <img src="../assets/yincang.png" alt="">
      </div>
      <div class="menu-list" v-show="showMenu">
        <ul class="list">
          <li @click="openSports">
            <img src="../assets/l-sports.png" alt="">
          </li>
          <li @click="openGame">
            <img src="../assets/l-game.png" alt="">
          </li>
          <li @click="openDoc">
            <img src="../assets/l-zhiyin.png" alt="">
          </li>
          <li @click="closeMenu">
            <img src="../assets/l-up.png" alt="">
          </li>
        </ul>
      </div>
      <div class="open-menu" v-show="!showMenu" @click="openMenu">
        <img src="../assets/l-up.png" alt="">
      </div>
    </div>
    <!-- <div class="open-menu" @click.stop>
      <div class="open">
        <p>
          <img src="../assets/l-up.png" alt="菜单栏" />
        </p>
      </div>
      <div class="menu">
        <p class="p1" @click="goSports">
          <img src="../assets/l-sports.png" alt="AI运动" />
        </p>
        <p class="p2" @click="goGame">
          <img src="../assets/l-game.png" alt="游戏" />
        </p>
        <p class="p3" @click="goDoc">
          <img src="../assets/l-zhiyin.png" alt="新人引导" />
        </p>
      </div>
    </div> -->
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
export default {
  name: "XiaoPang",
  data() {
    return {
      showMenu: !false
    }
  },
  methods: {
    touchXp() {
      console.log("触发交互");
    },
    openMenu() {
      this.showMenu = true;
    },
    openSports() {
      console.log("AI运动");
    },
    openGame() {
      console.log("进入游戏");
    },
    openDoc() {
      console.log("新手引导");
    },
    closeMenu() {
      this.showMenu = false;
    }
  },
  mounted() {
    // let ipcRenderer = require("electron").ipcRenderer;
    
    let latestMouseDownCoor = [];
    let latestMouseUpCoor = [];

    window.addEventListener("mousedown", (e) => {
      // console.log('mousedown');
      latestMouseDownCoor = [e.screenX, e.screenY];
      ipcRenderer.send("on-drag-listen", "floatBar");
    });

    window.addEventListener("mouseup", (e) => {
      // console.log('mouseup');
      latestMouseUpCoor = [e.screenX, e.screenY];
      ipcRenderer.send("remove-drag-listen");
    });

    window.addEventListener(
      "click",
      (e) => {
        // console.log('click');
        ipcRenderer.send("remove-drag-listen");
        if (
          latestMouseDownCoor[0] != latestMouseUpCoor[0] ||
          latestMouseDownCoor[1] != latestMouseUpCoor[1]
        ) {
          e.stopPropagation();
        }
      },
      true
    );
  },
  // directives: {
  //   drag: function (el) {
  //     let dragBox = el; //获取当前元素
  //     dragBox.onmousedown = (e) => {
  //       //算出鼠标相对元素的位置
  //       let disX = e.clientX - dragBox.offsetLeft;
  //       let disY = e.clientY - dragBox.offsetTop;
  //       document.onmousemove = (e) => {
  //         //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
  //         let left = e.clientX - disX;
  //         let top = e.clientY - disY;
  //         //移动当前元素
  //         // dragBox.style.left = left + "px";
  //         // dragBox.style.top = top + "px";
  //         ipcRenderer.send('sync-render', {left,top});
  //       };
  //       document.onmouseup = () => {
  //         //鼠标弹起来的时候不再移动
  //         document.onmousemove = null;
  //         //预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
  //         document.onmouseup = null;
  //       };
  //     };
  //   },
  // },
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
  border: 1px solid red;
}
.xiao-pang {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 150px;
  height: 150px;
  background: url("../assets/xiaopangpang.gif");
  background-size: cover;
  border: 1px solid black;
}
/* .xiao-pang:hover + .menu {
  display: block;
} */
.menu {
  /* display: none; */
  /* border: 1px solid red; */
  width: 20px;
  height: 100px;
  position: absolute;
  bottom: 15px;
  right: 7px;
}
.hide, .menu-list, .open-menu {
  position: absolute;
  right: 0px;
  width: 20px;
}
.hide {
  top: 0px;
  height: 20px;
  /* border: 1px solid #000; */
}
.hide > img {
  width: 20px;
  height: 20px;
}
.menu-list {
  bottom: 0px;
  height: 80px;
  /* border: 1px solid red; */
}
.open-menu {
  bottom: 0px;
  height: 20px;
  /* border: 1px solid #000; */
}
.open-menu > img {
  width: 20px;
  height: 20px;
}
.list > li {
  list-style: none;
  width: 20px;
  height: 20px;
  /* border: 1px solid greenyellow; */
}
.list > li > img {
  width: 20px;
  height: 20px;
}



/* .open-menu {
  width: 30px;
  height: 135px;
  overflow: hidden;
  position: absolute;
  right: 0px;
  bottom: 20px;
}
.open-menu > p {
  height: 30px;
  margin: 5px 0px;
}
.open-menu > div > p > img {
  width: 30px;
  height: 30px;
}
.open-menu > div > .p3 > img {
  width: 28px;
  height: 28px;
}
.menu {
  transition: opacity 1s;
  opacity: 0;
}
.open {
  position: absolute;
  bottom: 0px;
  padding: 1px;
  cursor: default;
}
.open-menu:hover .menu {
  opacity: 1;
} */
</style>