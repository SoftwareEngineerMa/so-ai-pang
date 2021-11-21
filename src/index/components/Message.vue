<template>
  <div id="message" class="message">
      {{ message[0] }}
      <br v-show="confirm" />
      <div v-show="confirm" class="confirm-wrap">
        <div class="cancel" @click="onCancel">Cancel</div>
        <div class="ok" @click="onOK">OK</div>
      </div>
      <!-- <div  v-show="alert" class="alert-wrap">
        <div class="alertOK" @click="onAlertOK">OK</div>
      </div> -->
  </div>
</template>

<script>
export default {
  name: 'Message',
  props:{ message: Array },
  data() {
    return {
      msgBox: '',
      confirm: false,
      alert: false
    }
  },
  watch: {
    message(val) {
      if(!val || val.length === 0) {
        this.msgBox.style.display = 'none'
        return
      }
      if(val) {
        this.msgBox.style.display = 'block'
        if (val[2] === 1) {
          this.confirm = true;
          return
        }
      }
    }
  },
  mounted() {
    this.msgBox = document.getElementById('message')
  },
  methods: {
    onCancel() {
      this.msgBox.style.display = 'none';
      this.confirm = false;
      this.$emit('confirm-cancel');
    },
    onOK() {
      this.confirm = false;
      this.msgBox.style.display = 'none';
      this.$emit('confirm-ok');
    },
    onAlertOK() {
      this.alert = false;
      this.msgBox.style.display = 'none';
      this.$emit('alert-ok');
    }
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
  right: 70px;
  top: -70px;
  padding: 8px;
  max-width: 190px;
}

.confirm-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ok {
  margin-left: 20px;
}

.cancel,.ok {
  display: inline-block;
  width: 60px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  font-weight: bold;
  margin-top: 5px;
  border-radius: 5px;
  background-color: #cacbcb;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.cancel:hover,.ok:hover {
  background-color: rgb(255, 221, 62);
  color: aliceblue;
}

/* .alertOK {
  width: 130px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  font-weight: bold;
  margin-top: 5px;
  margin-left: 2px;
  border-radius: 5px;
  background-color: #cacbcb;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.alertOK:hover {
  background-color: #0c75eb;
  color: aliceblue;
} */

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