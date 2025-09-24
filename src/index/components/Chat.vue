<template>
  <div id="chat" class="chat" >
    <textarea class="chatBox" ref="chatRef" @keyup.enter="sendChat" :style="{ 'width':'100%', 'height': '100%' }" placeholder="对小胖说："></textarea>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  // props:{ chat: Array },
  data() {
    // return {
    //   chatRef: '',
    // }
  },
  watch: {
    // chat(val) {
    //   // if(!val || val.length === 0) {
    //   //   this.chatRef.style.display = 'none' 
    //   //   return
    //   // }
    //   if(val) {
    //     if((val[0].length > 30 && val[2] === 1) || val[0].length > 60) {
    //       this.chatTop = -70
    //     } else if (val[0].length <= 12 ) {
    //       this.chatTop = -20
    //     } else {
    //       this.chatTop = -40
    //     }
    //     this.chatRef.style.display = 'block'
    //     if (val[2] === 1) {
    //       this.confirm = true;
    //       return
    //     }
    //   }
    // }
  },
  mounted() {
    // this.chatRef = document.getElementById('chat')
  },
  methods: {
    // onCancel() {
    //   this.chatRef.style.display = 'none';
     
    // },
    // onOK() {
    //   this.chatRef.style.display = 'none';
    // },
    // onAlertOK() {
    //   this.chatRef.style.display = 'none';
    //   // this.$emit('alert-ok');
    // },
    sendChat() {
      this.$emit('send-chat', this.$refs.chatRef.value);
      this.$refs.chatRef.value = '';
    }
  }
}
</script>

<style>
.chat {
  color: #333;
  background-color: #FFF2BB;
  position: absolute;
  text-align: left;
  z-index: 99;
  border-radius: 10px;
  font-size: 12px;
  right: 70px;
  padding: 8px;
  height: 80px;
  width: 160px;
  top: -60px;
}

textarea {
  background: transparent;
  border: none;
  resize: none;
  outline: none;
}

.chat::after {
  content: '';
  display: block;
  background-color: #FFF2BB;
  position: absolute;
  transform:rotate(45deg);
  width: 8px;
  height: 8px;
  right: 20px;
  bottom: -4px;
}
</style>