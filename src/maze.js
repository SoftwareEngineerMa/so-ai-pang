import Vue from 'vue';
import Maze from './mazeGame/maze.vue';
import './assets/font/font.css';

new Vue({
    render: h => h(Maze),
}).$mount('#app')