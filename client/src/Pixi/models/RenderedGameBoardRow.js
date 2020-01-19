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
        sprite.anchor.set(0.5, 0.5);
        this.sprite = sprite;
        Core.renderer.registerGameBoardRow(this);
    }
    insertCard(card, unitIndex) {
        this.cards.splice(unitIndex, 0, card);
    }
    includesCard(card) {
        return !!this.findCardById(card.id);
    }
    getCardIndex(card) {
        const cardOnBoard = this.findCardById(card.id);
        return this.cards.indexOf(cardOnBoard);
    }
    findCardById(cardId) {
        return this.cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null;
    }
    removeCardById(cardId) {
        const cardOnBoard = this.findCardById(cardId);
        if (!cardOnBoard) {
            return;
        }
        this.cards.splice(this.cards.indexOf(cardOnBoard), 1);
        cardOnBoard.card.unregister();
    }
    clearRow() {
        this.cards.forEach(cardOnBoard => {
            Core.unregisterCard(cardOnBoard.card);
        });
        this.cards = [];
    }
    isHovered(mousePosition) {
        return this.sprite.containsPoint(mousePosition);
    }
}
//# sourceMappingURL=RenderedGameBoardRow.js.map