<template>
    <div class="alert-con">
        <div class="xiaopang"></div>
        <div class="text">
            {{ text }}
        </div>
        <div class="ok" @click="() => this.$emit('ok-click')">OK</div>
    </div>
</template>

<script>
export default {
    name: "Alert",
    props: {
        text: String
    }
}
</script>

<style scoped>
.alert-con {
    position: absolute;
    top: 125px;
    width: 100%;
    height: 80%;
    border-radius: 10px;
    transform: translateY(-50%);
    background-color: #F5F6F8;
}

.xiaopang {
    position: absolute;
    width: 70px;
    height: 70px;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-image: url('../../../public/icon.png');
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

.ok {
    position: absolute;
    left: 50%;
    width: 200px;
    height: 30px;
    bottom: 10px;
    border-radius: 5px;
    font-weight: bold;
    line-height: 30px;
    transform: translateX(-50%);
    background-color: #CACBCB;
    cursor: pointer;
}

.ok:hover{
    background-color: #0C75EB;
    color: aliceblue;
}
</style>