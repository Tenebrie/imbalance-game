import * as PIXI from 'pixi.js';
import Core from '@/Pixi/Core';
export default class TargetingArrow {
    constructor() {
        this.arrowLine = new PIXI.Graphics();
        this.startingPoint = new PIXI.Graphics();
        this.targetPoint = new PIXI.Graphics();
        Core.renderer.pixi.stage.addChild(this.arrowLine);
        Core.renderer.pixi.stage.addChild(this.startingPoint);
        Core.renderer.pixi.stage.addChild(this.targetPoint);
    }
    destroy() {
        Core.renderer.pixi.stage.removeChild(this.arrowLine);
        Core.renderer.pixi.stage.removeChild(this.startingPoint);
        Core.renderer.pixi.stage.removeChild(this.targetPoint);
    }
}
//# sourceMappingURL=TargetingArrow.js.map