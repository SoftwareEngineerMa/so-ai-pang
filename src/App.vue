<template>
  <div id="app">
    <Home msg="Welcome to HuangXiaoPang Vue.js App" :handPose="handPose"/>
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
import Home from './components/Home.vue'
import setupCamera from './utils/setCamera';
import detectFace from './utils/facedetect';
import detectHand from './utils/handdetect';
import detectExpression from './utils/emotiondetect';

export default {
  name: 'App',
  components: {
    Home
  },
  data: function() {
    return {
      facePose: 'normal',
      handPose: ''
    };
  },
  async mounted() {
    const video = await setupCamera();
    if(video) {
      await video.play();

      // 调用人脸检测示例
      const predictionFace = await detectFace();
      setInterval(() => {
        predictionFace().then((res)=>{
          this.facePose = res;
          console.log(this.facePose);
        });
        
      }, 1000);

      // 调用手部检测示例
      const predictionHand = await detectHand();
      setInterval(() => {
        predictionHand().then(res => {
          this.handPose = res;
          console.log(this.handPose);
        });
      }, 1000);

      // 调用情绪检测示例
      const a = await detectExpression(video);
      setInterval(() => {
        a().then(res => {
          console.log(res);
        });
      }, 1000);
    }
    
  },
  
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body {
  /* background-color: #ffffff00; */
}
</style>
