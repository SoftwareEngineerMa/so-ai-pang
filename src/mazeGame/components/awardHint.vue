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
            .pipe(filter(data => data.type === bcType.HINT_HIDE), delay(500))
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
    width: 30px;
    height: 30px;
    top: 50%;
    left: 50%;
    color: aliceblue;
    transform: translate(-50%, -50%);
    font-size: 30px;
    font-weight: bold;
    transition: opacity 0.7s, transform 0.7s;
}

div[show='false'] {
    opacity: 0;
}

div[show='true'] {
    opacity: 1;
}

.left{
    padding-right: 10%;
}

.left[show='false'] {
    transform:translate(-70%, -50%);
}

.left[show='true'] {
    transform:translate(-50%, -50%);
    transition: 0s;
}

.top {
    padding-bottom: 10%;
}

.top[show='false'] {
    transform: translate(-50%, -70%);
}

.top[show='true'] {
    transform: translate(-50%, -50%);
    transition: 0s;
}


.right {
    padding-left: 10%;
}

.right[show='false'] {
    transform: translate(-30%, -50%);
}

.right[show='true'] {
    transform: translate(-50%, -50%);
    transition: 0s;
}


.bottom {
    padding-top: 10%;
}

.bottom[show='false'] {
    transform: translate(-50%, -30%);
}

.bottom[show='true'] {
    transform: translate(-50%, -50%);
    transition: 0s;
}








</style>
