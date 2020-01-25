import * as PIXI from 'pixi.js';
import Core from '@/Pixi/Core';
export default class TargetingLine {
    constructor() {
        this.arrowLine = new PIXI.Graphics();
        this.startingPoint = new PIXI.Graphics();
        this.targetPoint = new PIXI.Graphics();
    }
    create() {
        Core.renderer.rootContainer.addChild(this.arrowLine);
        Core.renderer.rootContainer.addChild(this.startingPoint);
        Core.renderer.rootContainer.addChild(this.targetPoint);
    }
    destroy() {
        Core.renderer.rootContainer.removeChild(this.arrowLine);
        Core.renderer.rootContainer.removeChild(this.startingPoint);
        Core.renderer.rootContainer.removeChild(this.targetPoint);
    }
}
//# sourceMappingURL=TargetingLine.js.map