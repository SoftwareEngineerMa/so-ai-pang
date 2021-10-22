import { HxpMManager } from "./hxpMManager";

// 雪碧图动画的定时器
let timer = null;
// hxp动画的单帧宽度
let animationWidth = 650;

let xpos = 0;


// 元素淡入
export function fadeIn(selector: string, callback?: Function) {
    const el = document.querySelector(selector) as HTMLElement;
    el.style.opacity = '0';
    el.style.display = 'block';
    let op = 0;
    const ti = setInterval(() => {
        el.style.opacity = `${(op += 0.1)}`;
        if (op >= 1) {
            if (callback) {
                callback();
            }
            clearInterval(ti);
        }
    }, 10)
}

// 元素淡出
export function fadeOut(selector: string, callback?: Function) {
    const el = document.querySelector(selector) as HTMLElement;
    let op = 1;
    const to = setInterval(() => {
        el.style.opacity = `${(op -= 0.1)}`;
        if (op <= 0) {
            if (callback) {
                callback();
            }
            clearInterval(to);
        }
    }, 10)
}


// 控制模型执行某个动作
export function startMotion(group: string, no: number,) {
    HxpMManager.getInstance()
        .getModel()
        .startMotion(group, no, 3);
}

// 模型展示标签显示和隐藏
export function modelHidden() {
    const canvas = document.querySelector('.test') as HTMLElement;
    const animation = document.querySelector('.animation') as HTMLElement;

    if (canvas.style.display !== 'none') {
        canvas.style.display = 'none';
        animation.style.display = 'block';
    } else {
        canvas.style.display = 'block';
        animation.style.display = 'none';
    }
}

// 动画初始化
export function animationInit() {
    xpos = 0;
}

// 雪碧图动画播放
export function animationPlay(seletor: string) {
    const el = document.querySelector(seletor) as HTMLElement;
    animationInit();
    if (timer) {
        // 如果动画正在播放则重新播放
        clearInterval(timer);
        timer = null;
        animationPlay(seletor);
    } else {
        timer = setInterval(() => {
            el.style.backgroundPosition = -1 * (xpos += animationWidth) % (animationWidth * 30) + 'px'
        }, 50)
    }
}

// 切换状态
export function changeStatus() {
    const canvas = document.querySelector('.test') as HTMLElement;
    const animation = document.querySelector('.animation') as HTMLElement;


    if (canvas.style.display === 'none') {
        fadeOut('.animation', () => {
            animation.style.display = 'none';
            fadeIn('.test')
        });
    } else {
        fadeOut('.test', () => {
            canvas.style.display = 'none';
            fadeIn('.animation')
        });
    }
}

// 动画窗口的大小自适应
export function animationResize(seletor: string) {
    const animation = document.querySelector(seletor) as HTMLElement;
    if (window.innerWidth < window.innerHeight) {
        animation.style.width = window.innerWidth + 'px';
        animation.style.height = window.innerWidth * 15 / 13 + 'px';
        if (window.innerWidth > 650) {
            animationWidth = 650;
        } else {
            animationWidth = window.innerWidth;
        }
    } else {
        animation.style.height = window.innerHeight + 'px';
        animation.style.width = window.innerHeight * 13 / 15 + 'px';
        if (window.innerHeight > 750) {
            animationWidth = 650;
        } else {
            animationWidth = window.innerHeight * 13 / 15;
        }
    }
}








