import Core from '@/Pixi/Core';
import * as PIXI from 'pixi.js';
import Card from '@/shared/models/Card';
export default class RenderedCard extends Card {
    constructor(card) {
        super(card.id, card.cardType, card.cardClass);
        this.power = card.power;
        this.attack = card.attack;
        this.basePower = card.basePower;
        this.baseAttack = card.baseAttack;
        this.sprite = this.createSprite();
        this.hitboxSprite = this.createHitboxSprite(this.sprite);
        Core.registerCard(this);
    }
    getPosition() {
        return this.hitboxSprite.position;
    }
    isHovered(mousePosition) {
        return this.hitboxSprite.containsPoint(mousePosition);
    }
    reveal(cardType, cardClass) {
        Core.unregisterCard(this);
        this.cardType = cardType;
        this.cardClass = cardClass;
        this.sprite = this.createSprite();
        Core.registerCard(this);
    }
    unregister() {
        Core.unregisterCard(this);
    }
    createSprite() {
        const texture = PIXI.Texture.from(`assets/cards/${this.cardClass}.png`);
        const sprite = new PIXI.Sprite(texture);
        texture.baseTexture.on('loaded', () => {
            sprite.alpha = 0;
        });
        sprite.scale.set(0.5, 0.5);
        sprite.anchor.set(0.5, 0.5);
        sprite.alpha = 0;
        sprite.tint = 0xFFFFFF;
        return sprite;
    }
    createHitboxSprite(sprite) {
        const hitboxSprite = new PIXI.Sprite(sprite.texture);
        sprite.texture.baseTexture.on('loaded', () => {
            hitboxSprite.alpha = 0;
        });
        hitboxSprite.scale.set(0.5, 0.5);
        hitboxSprite.anchor.set(0.5, 0.5);
        hitboxSprite.position.set(-1000, -1000);
        hitboxSprite.tint = 0xAA5555;
        hitboxSprite.zIndex = -1;
        return hitboxSprite;
    }
    static fromCard(card) {
        return new RenderedCard(card);
    }
}
//# sourceMappingURL=RenderedCard.js.map