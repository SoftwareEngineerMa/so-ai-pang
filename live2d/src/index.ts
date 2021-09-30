import { HxpAgent } from "./hxpAgent";
import { startMotion } from "./control";


if (HxpAgent.getInstance().initialize()) {
    HxpAgent.getInstance().run()
}

document.querySelector('.m').addEventListener('click', () => {
    startMotion('TapBody', 0)
})
