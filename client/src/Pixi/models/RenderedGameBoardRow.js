import Core from '@/Pixi/Core';
import * as PIXI from 'pixi.js';
import GameBoardRow from '@/Pixi/shared/models/GameBoardRow';
import TextureAtlas from '@/Pixi/render/TextureAtlas';
export default class RenderedGameBoardRow extends GameBoardRow {
    constructor(index) {
        super(index);
        this.cards = [];
        this.owner = null;
        this.spriteOwned = new PIXI.Sprite(TextureAtlas.getTexture('board/boardRow_owned'));
        this.spriteNeutral = new PIXI.Sprite(TextureAtlas.getTexture('board/boardRow_neutral'));
        this.spriteOpponent = new PIXI.Sprite(TextureAtlas.getTexture('board/boardRow_opponent'));
        this.spriteOwned.anchor.set(0.5, 0.5);
        this.spriteNeutral.anchor.set(0.5, 0.5);
        this.spriteOpponent.anchor.set(0.5, 0.5);
        this.spriteOwned.visible = false;
        this.spriteOpponent.visible = false;
        this.container = new PIXI.Container();
        this.container.addChild(this.spriteOwned);
        this.container.addChild(this.spriteNeutral);
        this.container.addChild(this.spriteOpponent);
        Core.renderer.registerGameBoardRow(this);
    }
    getHeight() {
        return this.spriteNeutral.texture.height;
    }
    insertUnit(card, unitIndex) {
        this.cards.splice(unitIndex, 0, card);
    }
    includesCard(card) {
        return !!this.findUnitById(card.id);
    }
    getCardIndex(card) {
        const cardOnBoard = this.findUnitById(card.id);
        return this.cards.indexOf(cardOnBoard);
    }
    findUnitById(cardId) {
        return this.cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null;
    }
    removeUnit(targetUnit) {
        this.cards = this.cards.filter(unit => unit !== targetUnit);
    }
    destroyUnit(targetUnit) {
        this.removeUnit(targetUnit);
        targetUnit.card.unregister();
    }
    clearRow() {
        this.cards.forEach(cardOnBoard => {
            Core.unregisterCard(cardOnBoard.card);
        });
        this.cards = [];
    }
    setOwner(owner) {
        this.owner = owner;
        this.spriteOwned.visible = false;
        this.spriteNeutral.visible = false;
        this.spriteOpponent.visible = false;
        if (this.owner === Core.player) {
            this.spriteOwned.visible = true;
        }
        else if (this.owner === Core.opponent) {
            this.spriteOpponent.visible = true;
        }
        else {
            this.spriteNeutral.visible = true;
        }
    }
    isHovered(mousePosition) {
        return (this.owner === Core.player && this.spriteOwned.containsPoint(mousePosition)) || (this.owner === null && this.spriteNeutral.containsPoint(mousePosition)) || (this.owner === Core.opponent && this.spriteOpponent.containsPoint(mousePosition));
    }
}
//# sourceMappingURL=RenderedGameBoardRow.js.map