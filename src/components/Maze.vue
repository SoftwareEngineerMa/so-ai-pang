<template>
    <div>
        <span id="level"></span>
    </div>
    
</template>


<script>
import { start } from '../mazeGame/maze';

export default {
    name: 'Maze',
    props: {},
    mounted: function(){
        start();
    }
}
</script>