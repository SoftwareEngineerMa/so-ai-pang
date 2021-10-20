import { Subject } from "rxjs";



export const bcType = {
    HXP_SLEEP: 'hxp: sleep',
    HXP_REVIVE: 'hxp: revive',
    HXP_DIVERSION: 'hxp: diversion',
    HINT_SHOW: 'hint: show',
    HINT_HIDE: 'hint: hide',
    TIMER_UPDATE: 'timer: update',
    TIP_SHOW: 'tip: show'
}



export const boardcast = new Subject();