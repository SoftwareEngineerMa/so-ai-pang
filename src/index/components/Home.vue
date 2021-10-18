<template>
  <div class="hello">
    <!-- <h1>{{ name }}</h1> -->
    <img src="../../assets/gif/angry.gif" v-show="isOdd"/>
    <img src="../../assets/gif/cry.gif" v-show="!isOdd"/>
    <Maze></Maze>

  </div>
</template>

<script>
export default {
  data: function() {
    return {
        name: 'HelloWorld',
        isOdd: false
      };
},
 
  props: {
    handPose: String,
  },

  
  mounted(){
    // setInterval(()=>{
    //   this.isOdd = !this.isOdd;
    // }, 3000);
  },
  watch: {
    handPose: function(){
      if(this.handPose == 'thumbs_up'){
        this.isOdd = true;
      } else if(this.handPose == 'zhan'){
        this.isOdd = false;
      }
    }
  }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
