<template>
    <div :class='pos' :show='show'>
        +1
    </div>
</template>

<script>
import { bcType, boardcast } from '../subject'
import {  delay, filter, throttleTime } from 'rxjs/operators'

export default {
    name: 'AwardHint',
    data: function() {
        return {
            pos: 'left',
            show: 'false',
            hideSwitch: true
        }
    },
    mounted: function() {
        boardcast
            .pipe(filter(data => data.type === bcType.HXP_DIVERSION))
            .subscribe((data) => {
                this.pos = data.value;
            })
        boardcast
            .pipe(filter(data => data.type === bcType.HINT_SHOW),throttleTime(100))
            .subscribe(() => {
                if (this.show === "true") {
                    this.hideSwitch = false;
                }
                this.show = 'true';
                boardcast.next({type: bcType.HINT_HIDE, value: 99})
            })
        boardcast
            .pipe(filter(data => data.type === bcType.HINT_HIDE), delay(1000))
            .subscribe(() => {
                if (this.hideSwitch) {
                    this.show = 'false'
                } else {
                    this.hideSwitch = true;
                }
            })
    }

}
</script>

<style scoped>
div{
    position: absolute;
    width: 20px;
    height: 20px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 20px;
    font-weight: bold;
    transition: opacity 0.7s;
}

div[show='false'] {
    opacity: 0;
}

dis[show='true'] {
    opacity: 1;
}

.left{
    padding-right: 10%;
}

.top {
    padding-bottom: 10%;
}


.right {
    padding-left: 10%;
}


.bottom {
    padding-top: 10%;
}








</style>
