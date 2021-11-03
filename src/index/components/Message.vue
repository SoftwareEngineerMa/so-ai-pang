<template>
  <div id="message" class="message">
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
        this.msgBox.style.display = 'block'
        setTimeout(() => {
          this.msgBox.style.display = 'none'
        }, this.message[1] * 1000)
    }
  },
  mounted() {
    this.msgBox = document.getElementById('message')
      setTimeout(() => {
        this.msgBox.style.display = 'none'
      }, this.message[1] * 1000)
  }
}
</script>

<style>
.message {
  /* border: 1px solid red; */
  padding: 10px;
  max-width: 124px;
  font-size: 12px;
  color: #333;
  background-color: #FFF2BB;
  border-radius: 10px;
  position: absolute;
  right: 170px;
  top: 10px;
  z-index: 99;
  /* opacity: 1; */
  text-align: left;
  /* transition: opacity 3s; */
}
.message::after {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  background-color: #FFF2BB;
  position: absolute;
  right: 20px;
  bottom: -4px;
  transform:rotate(45deg);
}
</style>