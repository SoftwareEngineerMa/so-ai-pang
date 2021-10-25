<template>
  <div id="app">
    <XiaoPang/>
  </div>
</template>

<script>
import XiaoPang from './components/XiaoPang.vue'

export default {
  name: 'App',
  components: {
    XiaoPang
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 50px;
  margin-left: 100px;
}
</style>
