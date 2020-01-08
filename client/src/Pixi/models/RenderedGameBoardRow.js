import Core from '@/Pixi/Core';
import * as PIXI from 'pixi.js';
import GameBoardRow from '@/shared/models/GameBoardRow';
export default class RenderedGameBoardRow extends GameBoardRow {
    constructor() {
        super();
        this.cards = [];
        const texture = PIXI.Texture.from('assets/board/boardRow.png');
        const sprite = new PIXI.Sprite(texture);
        texture.baseTexture.on('loaded', () => {
            sprite.alpha = 0;
        });
        sprite.scale.set(0.4);
        sprite.anchor.set(0.5, 0.5);
        this.sprite = sprite;
        Core.renderer.registerGameBoardRow(this);
    }
    isHovered(mousePosition) {
        return this.sprite.containsPoint(mousePosition);
    }
}
//# sourceMappingURL=RenderedGameBoardRow.js.map