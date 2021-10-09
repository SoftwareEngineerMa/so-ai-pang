import { HxpAgent } from "./hxpAgent";
import { animationInit, animationPlay, animationResize, changeStatus, modelHidden, startMotion } from "./hxpControl";


// 动画的dom对象
let animation: HTMLElement = null;


// 页面加载完毕时进行动画窗口大小的自适应调整
window.onload = () => {
    animation = document.querySelector('.animation') as HTMLElement;
    animationResize('.animation');
    if (HxpAgent.getInstance().initialize()) {
        HxpAgent.getInstance().run()
    }
}

// 页面窗口大小调整时，模型及动画大小进行自适应调整
window.onresize = () => {
    HxpAgent.getInstance().onResize();
    animationInit();
    animationResize('.animation')
}



// 测试
document.querySelector('.m').addEventListener('click', () => {
    startMotion('TapBody', 0)
})


document.querySelector('.h').addEventListener('click', () => {
    changeStatus();
})

document.querySelector('.play').addEventListener('click', () => {
    animationPlay('.animation');
})





