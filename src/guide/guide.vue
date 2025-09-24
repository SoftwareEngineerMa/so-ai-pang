<template>
  <div class="guide" :style="{ width: width + 'px', height: height + 'px' }">
    <div class="close" @click="closeClick"></div>
    <div class="p_container">
      <p class="p_1">Hi, 对面的靓仔！</p>
      <p class="p_2">我是黄小胖，来自一个叫360的神秘星球。</p>
      <p class="p_2">陪伴是最长情的告白，请让我陪你工作、生活，</p>
      <p class="p_2">一起健康成长吧～我不会打扰专注工作的你，但</p>
      <p class="p_2">因为牵挂，会不时过来瞄一眼你。</p>
      <p></p>
      <p class="p_2">
        <span class="bang"></span>、<span class="victory"></span>、<span
          class="gun"
        ></span
        >、<span class="hi"></span>、<span class="ok"></span>，将是我们今
      </p>
      <p class="p_2">后沟通的暗号。我很想穿过摄像头，知道今天</p>
      <p class="p_2">的你工作还顺利么？知道你很努力，但久坐不</p>
      <p class="p_2">动不太好哦！我正在散步，但好像误入了一个</p>
      <p class="p_2">迷宫，你休息一下，陪我走出去吧？</p>
    </div>
    <!-- <div class="p_promise">
      <p>
        小胖承诺：您的数据将始终被安全地保存在本地，不会存在任何数据泄露的风险，请放心开启摄像头。如果您仍需关闭摄像头，
      </p>
      <p>
        可点击菜单中的摄像头按钮，待按钮置灰即已关闭次功能，360持续为您的数据安全保驾护航。
      </p>
    </div> -->
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  name: "Guide",
  data() {
    return {
      width: window.innerWidth,
      height: window.innerWidth * 0.7359,
    };
  },
  mounted: function() {
    this.onResize();
    console.log(window.innerWidth, window.innerHeight);
    window.onresize = this.onResize;
  },
  methods: {
    onResize() {
      this.width = window.innerWidth;
      this.height = window.innerWidth * 0.7359;
    },

    closeClick() {
      ipcRenderer.send("guide-close");
    },
  },
};
</script>

<style scoped>
html {
  overflow: hidden;
}

body {
  padding: 0 0;
  margin: 0 0;
  overflow: hidden;
  -webkit-app-region: drag;
}
.guide {
  border-radius: 20px;
  background-image: url("/img/guide_.png");
  background-size: cover;
  overflow: hidden;
  -webkit-app-region: drag;
}

.close {
  position: absolute;
  right: 2px;
  width: 30px;
  height: 30px;
  background-image: url("../../public/img/close.png");
  background-size: cover;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.p_container {
  position: absolute;
  top: 36%;
  left: 12%;
  color: #272727;
}

.p_1 {
  font-size: 1.8vw;
}
.p_2 {
  font-size: 1.5vw;
  margin: 0.7vw 0;
  color: #302e2e;
}

.p_promise {
  position: absolute;
  top: 85%;
  left: 12%;
}

.p_promise p {
  margin: 5px 0;
  font-size: 1.4vw;
  color: #8e570b;
}

.bang {
  display: inline-block;
  width: 3vw;
  height: 3vw;
  background-image: url("../../public/img/good.png");
  background-size: cover;
}

.victory {
  display: inline-block;
  width: 2vw;
  height: 3vw;
  background-image: url("../../public/img/victory.png");
  background-size: cover;
}

.gun {
  display: inline-block;
  width: 3.5vw;
  height: 2.3vw;
  background-image: url("../../public/img/gun.png");
  background-size: cover;
}

.hi {
  display: inline-block;
  width: 3vw;
  height: 3vw;
  background-image: url("../../public/img/hi.png");
  background-size: cover;
}

.ok {
  display: inline-block;
  width: 2.5vw;
  height: 3vw;
  background-image: url("../../public/img/ok.png");
  background-size: cover;
}
</style>
