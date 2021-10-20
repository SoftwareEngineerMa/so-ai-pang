<template>
  <div id="app">
    <video id="video" playsinline style="
      -webkit-transform: scaleX(-1);
      transform: scaleX(-1);
      width: auto;
      height: auto;
      display: none;
      ">
    </video>
    <a href="/maze.html">maze</a>
  </div>
</template>

<script>

export default {
  name: 'App',
  
  data: function() {
    return {
      facePose: 'normal',
      handPose: ''
    };
  },
  async mounted() {
    // const video = await setupCamera();
    // if(video) {
    //   await video.play();

    //   // 调用人脸检测示例
    //   const predictionFace = await detectFace();
    //   setInterval(() => {
    //     predictionFace().then((res)=>{
    //       this.facePose = res;
    //       console.log(this.facePose);
    //     });
        
    //   }, 1000);

      // // 调用手部检测示例
      // const predictionHand = await detectHand();
      // setInterval(() => {
      //   predictionHand().then(res => {
      //     this.handPose = res;
      //     console.log(this.handPose);
      //   });
      // }, 1000);

    //   // 调用情绪检测示例
    //   const a = await detectExpression(video);
    //   setInterval(() => {
    //     a().then(res => {
    //       console.log(res);
    //     });
    //   }, 1000);
    // }
    
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
