import { Subject } from "rxjs";



export const bcType = {
    HXP_SLEEP: 'hxp: sleep',
    HXP_REVIVE: 'hxp: revive',
    HXP_TURE_TO: 'hxp: turn to',
    HXP_RUN: 'hxp: run',
    HXP_SHOW: 'hxp: show',
    HXP_HIDE: 'hxp: hide',
    HXP_DIVERSION: 'hxp: diversion',
    HINT_SHOW: 'hint: show',
    HINT_HIDE: 'hint: hide',
    TIMER_UPDATE: 'timer: update',
    TIP_SHOW: 'tip: show',
    TIP_UPDATE: 'tip: update',
    SHADE_SHOW: 'shade: show',
    SHADE_HIDE: 'shade: hide',
    LEVEL_SHOW: 'level: show',
    LEVEL_HIDE: 'level: hide',
    VICTORY: 'victory',
}



export const boardcast = new Subject();