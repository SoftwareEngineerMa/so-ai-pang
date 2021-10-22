<template>
  <div class="message">
      {{ message[0] }}
  </div>
</template>

<script>
export default {
  name: 'Message',
  props:{ message: Array },
  data() {
    return {
      msgBox: ''
    }
  },
  watch: {
    message() {
        this.msgBox.style.opacity = '0.8'
        setTimeout(() => {
          this.msgBox.style.opacity = '0'
        }, this.message[1] * 1000)
    }
  },
  mounted() {
    this.msgBox = document.getElementsByClassName('message')[0]
      setTimeout(() => {
        this.msgBox.style.opacity = '0'
      }, this.message[1] * 1000)
  }
}
</script>

<style>
.message {
  /* border: 1px solid red; */
  padding: 5px;
  width: 120px;
  /* height: 60px; */
  font-size: 11px;
  color: #000;
  background: #fff;
  position: absolute;
  right: 110px;
  bottom: 100px;
  border-radius: 10px;
  z-index: 99;
  opacity: .8;
  transition: opacity 3s;
}
.message::after {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  background: #fff;
  position: absolute;
  right: 20px;
  bottom: -4px;
  transform:rotate(45deg);
}
</style>