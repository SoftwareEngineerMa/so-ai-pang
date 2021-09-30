import { HxpAgent } from "./hxpAgent";


if (HxpAgent.getInstance().initialize()) {
    HxpAgent.getInstance().run()
}


