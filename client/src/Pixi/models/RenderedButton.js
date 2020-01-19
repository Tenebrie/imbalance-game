import Core from '@/Pixi/Core';
import * as PIXI from 'pixi.js';
export default class RenderedButton {
    constructor(position, onClick) {
        this.text = this.createText();
        this.textBackground = this.createBackground();
        this.onClick = onClick;
        this.container = new PIXI.Container();
        this.container.position.copyFrom(position);
        this.container.addChild(this.textBackground);
        this.container.addChild(this.text);
    }
    isHovered(mousePosition) {
        return this.textBackground.containsPoint(mousePosition);
    }
    createText() {
        const text = new PIXI.Text('End turn', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0x000000
        });
        text.anchor.set(0.5);
        return text;
    }
    createBackground() {
        let textMetrics = PIXI.TextMetrics.measureText('Your text', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20
        }));
        const bounds = new PIXI.Rectangle(0, 0, textMetrics.width, textMetrics.height);
        bounds.pad(8, 4);
        const background = new PIXI.Graphics();
        background.beginFill(0x00FFFF);
        background.drawRect(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
        background.endFill();
        return background;
    }
    unregister() {
        Core.unregisterButton(this);
    }
}
//# sourceMappingURL=RenderedButton.js.map