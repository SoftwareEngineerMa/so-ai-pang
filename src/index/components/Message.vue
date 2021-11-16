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
    message(val) {
      if(val) {
        this.msgBox.style.display = 'block'
        setTimeout(() => {
          this.msgBox.style.display = 'none'
        }, this.message[1] * 1000)
      }
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
  color: #333;
  background-color: #FFF2BB;
  position: absolute;
  text-align: left;
  /* transition: opacity 3s; */
  z-index: 99;

  /* border-radius: 10px;
  font-size: 12px;
  right: 170px;
  top: 10px;
  padding: 10px;
  max-width: 140px; */
  border-radius: 10px;
  font-size: 12px;
  right: 100px;
  top: -40px;
  padding: 8px;
  max-width: 150px;
}
.message::after {
  content: '';
  display: block;
  background-color: #FFF2BB;
  position: absolute;
  transform:rotate(45deg);
  /* width: 10px;
  height: 10px;
  right: 20px;
  bottom: -4px; */
  width: 8px;
  height: 8px;
  right: 20px;
  bottom: -4px;
}
</style>