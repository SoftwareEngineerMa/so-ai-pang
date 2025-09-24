<template>
  <div class="confirm-con">
    <div class="xiaopang"></div>
    <div class="text">
      {{ text }}
    </div>
    <div class="cancel" @click="() => this.$emit('cancel-click')">Cancel</div>
    <div class="ok" @click="() => this.$emit('ok-click')">OK</div>
  </div>
</template>

<script>
export default {
  name: "Confirm",
  props: {
    text: String,
  },
};
</script>

<style scoped>
.confirm-con {
  position: absolute;
  top: 125px;
  width: 100%;
  height: 90%;
  border-radius: 10px;
  transform: translateY(-50%);
  background-color: #f5f6f8;
}

.xiaopang {
  position: absolute;
  width: 70px;
  height: 70px;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-image: url("../../../public/icon.png");
  background-size: cover;
}

.text {
  position: absolute;
  width: 100%;
  height: 100%;
  padding-right: 25px;
  font-size: 5vw;
  font-weight: bolder;
  top: 100px;
}

.cancel {
  position: absolute;
  bottom: 10px;
  left: 20px;
  line-height: 30px;
  font-weight: bold;
  width: 100px;
  height: 30px;
  border-radius: 5px;
  background-color: #cacbcb;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.ok {
  position: absolute;
  bottom: 10px;
  right: 20px;
  line-height: 30px;
  font-weight: bold;
  width: 100px;
  height: 30px;
  border-radius: 5px;
  background-color: #cacbcb;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.ok:hover {
  background-color: #0c75eb;
  color: aliceblue;
}

.cancel:hover {
  background-color: #0c75eb;
  color: aliceblue;
}
</style>
