<template>
<div class="maze-archive">
    <div class="archive-content">
        <h3 class="archive-title">存档</h3>
        <div class="archive-table">
            <div class="archive-col col-1">
                <div class="archive-item"><b>关卡</b></div>
                <div class="archive-item" v-for="i in levels" :key="i">
                    {{ i }}
                </div>
            </div>
            <div class="archive-col col-2">
                <div class="archive-item"><b>通关时间</b></div>
                <div class="archive-item" v-for="i in levels" :key="i">
                    {{ mazeJson[i]["time"] }}
                </div>
            </div>
            <div class="archive-col col-3">
                <div class="archive-item"><b>操作</b></div>
                <div class="archive-item" v-for="i in levels" :key="i" type="c">
                    载入
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import mazeJson from '../../assets/json/maze.json'

export default {
    name: 'MazeArchive',
    data: function() {
        return {
            mazeJson
        }
    },
    computed: {
        levels() {
            return Object.keys(this.mazeJson);
        }
    },
    mounted: function() {
        console.log(Object.keys(mazeJson));
    }
    
}

</script>


<style scoped>

.maze-archive {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 35vw;
    background: aliceblue;
    height: 0;
    padding-bottom: 40vw;
    border-radius: 15px;
}

.archive-content {
    position: absolute;
    width: 100%;
    height: 100%;
    text-align: center;
}

.archive-title {
    font-size: 2vw;
    margin: 10px auto;
}

.archive-table {
    display: flex;
    flex-direction: row;
    width: 90%;
    height: 80%;
    margin: 0 auto;
    font-size: 1.8vw;
}

.archive-col {
    display: flex;
    flex-direction: column;
}

.col-1 {
    flex-grow: 2;
    border-right: 1px solid grey;
}

.col-2 {
    flex-grow: 3;
    
}

.col-3 {
    flex-grow: 2;
    border-left: 1px solid grey;
}

.archive-item {
    width: 100%;
    height: 2.5vw;
    line-height: 2.5vw;
}

.archive-item[type="c"] {
    cursor: pointer;
} 




</style>
