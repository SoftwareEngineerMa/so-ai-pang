import { HxpMManager } from "./hxpMManager";


export function startMotion(group: string, no: number,) {
    HxpMManager.getInstance()
        .getModel()
        .startMotion(group, no, 3);
}



