//返回角度
function GetSlideAngle(dx: number, dy: number) {
    return Math.atan2(dy, dx) * 180 / Math.PI;
}

//根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动
function GetSlideDirection(startX: number, startY: number, endX: number, endY: number): number {
    let dy = startY - endY;
    let dx = endX - startX;
    //若是滑动距离过短
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        return 0;
    }
    let angle = GetSlideAngle(dx, dy);
    if (angle >= -45 && angle < 45) {
        return 4;
    } else if (angle >= 45 && angle < 135) {
        return 1;
    } else if (angle >= -135 && angle < -45) {
        return 2;
    } else {
        return 3;
    }
}

const vSwipe = {
    mounted: (el: HTMLElement, binding: any) => {
        let touchType = binding.arg; // 支持 up down left right
        let direction: number;
        //滑动处理
        let startX: number, startY: number;
        el.addEventListener('touchstart', (ev) => {
            startX = ev.touches[0].pageX;
            startY = ev.touches[0].pageY;
        }, false);
        el.addEventListener('touchend', (ev) => {
            let endX, endY;
            endX = ev.changedTouches[0].pageX;
            endY = ev.changedTouches[0].pageY;
            direction = GetSlideDirection(startX, startY, endX, endY);
            //根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动
            switch (direction) {
                case 1:
                    if (touchType === 'up') {
                        binding.value()
                    }
                    break;
                case 2:
                    if (touchType === 'down') {
                        binding.value()
                    }
                    break;
                case 3:
                    if (touchType === 'left') {
                        binding.value()
                    }
                    break;
                case 4:
                    if (touchType === 'right') {
                        binding.value()
                    }
                    break;
            }
        }, false);
    }
}

export default vSwipe;