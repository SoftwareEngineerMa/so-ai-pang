import { throttle } from './utils'

export default class Animation {

    // 动图定时器
    timer = null;
    el = null;
    _fps = 30;

    // 雪碧图当前的position(横向雪碧图)
    xpos = 0;
    // 动图一帧的宽度
    animationWidth;
    // 动图的帧数
    frameNum = 0;

    powerTimer = null;

    // // requestAnimationFrame返回戳
    // reframe = null;


    constructor(el, animationWidth, frameNum, fps) {
        this.el = el;
        this.animationWidth = animationWidth;
        this.frameNum = frameNum;
        this._fps = fps;
    }

    run = (delay) => {
        throttle(() => {
            this.draw();
        }, delay)();
    }



    pause = () => {
        clearInterval(this.timer);
    }

    get fps() {
        return this._fps;
    }


    setPos = () => {
        this.el.style.backgroundPosition = -1 * (this.xpos += this.animationWidth) % (this.animationWidth * this.frameNum) + 'px'
    }

    draw = () => {
        requestAnimationFrame(this.setPos);
    }


}