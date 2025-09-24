// 元素淡入
export function elFadeIn(selector, time, callback) {
    const el = document.querySelector(selector);
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
    }, time)
}

// 元素淡出
export function elFadeOut(selector, time, callback) {
    const el = document.querySelector(selector);
    let op = 1;
    const to = setInterval(() => {
        el.style.opacity = `${(op -= 0.1)}`;
        if (op <= 0) {
            el.style.display = 'none';
            if (callback) {
                callback();
            }
            clearInterval(to);
        }
    }, 10)
}


// 雪碧图动画播放
export function animationPlay(seletor, timer, animationWidth, frame) {
    const el = document.querySelector(seletor);
    let xpos = 0;
    console.log(animationWidth);
    if (timer) {
        // 如果动画正在播放则重新播放
        clearInterval(timer);
        timer = null;
        animationPlay(seletor, timer, animationWidth);
    } else {
        timer = setInterval(() => {
            el.style.backgroundPosition = -1 * (xpos += animationWidth) % (animationWidth * frame) + 'px'
        }, 100)
    }
}

// 防抖函数
export function throttle(fn, delay) {
    let valid = true
    return function () {
        if (!valid) {
            //休息时间 暂不接客
            return false
        }
        // 工作时间，执行函数并且在间隔期内把状态位设为无效
        valid = false
        setTimeout(() => {
            fn()
            valid = true;
        }, delay)
    }
}

export function isHit(ballPosition, awardPosition) {
    if (Math.abs(ballPosition.x - awardPosition.x) < 0.3 && Math.abs(ballPosition.y - awardPosition.y) < 0.3) {
        return true
    }
}
