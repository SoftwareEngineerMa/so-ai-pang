<template>
    <div :class='pos' :show='show'>
        +1
    </div>
</template>

<script>
import { bcType, boardcast } from '../subject'
import { filter, throttleTime, delay } from 'rxjs/operators'

export default {
    name: 'AwardHint',
    data: function() {
        return {
            pos: 'left',
            show: 'false'
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
                this.show = 'true'
                boardcast.next({type: bcType.HINT_HIDE})
            })
        boardcast
            .pipe(filter(data => data.type === bcType.HINT_HIDE), delay(1000))
            .subscribe(() => {
                this.show = 'false'
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
