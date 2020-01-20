import Core from '@/Pixi/Core';
import * as PIXI from 'pixi.js';
import Card from '@/Pixi/shared/models/Card';
import TextureAtlas from '@/Pixi/render/TextureAtlas';
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode';
import Localization from '@/Pixi/Localization';
import Settings from '@/Pixi/Settings';
import RichText from '@/Pixi/render/RichText';
import Utils from '@/utils/Utils';
import CardAttributes from '@/Pixi/render/CardAttributes';
import ScalingText from '@/Pixi/render/ScalingText';
export default class RenderedCard extends Card {
    constructor(message) {
        super(message.id, message.cardType, message.cardClass);
        this.displayMode = CardDisplayMode.UNDEFINED;
        this.cardName = message.cardName;
        this.cardTitle = message.cardTitle;
        this.cardTribes = message.cardTribes.slice();
        this.cardDescription = message.cardDescription;
        this.power = message.power;
        this.attack = message.attack;
        this.attackRange = message.attackRange;
        this.healthArmor = message.healthArmor;
        this.basePower = message.basePower;
        this.baseAttack = message.baseAttack;
        this.baseAttackRange = message.baseAttackRange;
        this.baseHealthArmor = message.baseHealthArmor;
        this.sprite = new PIXI.Sprite(TextureAtlas.getTexture(`cards/${this.cardClass}`));
        this.powerText = this.createPowerText(this.power ? this.power.toString() : '');
        this.attackText = this.createAttackText(this.attack ? this.attack.toString() : '');
        this.cardNameText = this.createCardNameText(Localization.getString(this.cardName));
        this.cardTitleText = this.createCardNameText(Localization.getString(this.cardTitle));
        this.cardDescriptionText = new RichText(this, Localization.getString(this.cardDescription), 350);
        this.hitboxSprite = this.createHitboxSprite(this.sprite);
        this.sprite.anchor.set(0.5);
        /* Internal container */
        const internalContainer = new PIXI.Container();
        internalContainer.position.x = -this.sprite.texture.width / 2;
        internalContainer.position.y = -this.sprite.texture.height / 2;
        this.sprite.addChild(internalContainer);
        /* Card attributes */
        this.cardModeAttributes = new CardAttributes(this, CardDisplayMode.IN_HAND);
        this.unitModeAttributes = new CardAttributes(this, CardDisplayMode.ON_BOARD);
        this.cardModeAttributes.position.set(this.sprite.texture.width, this.sprite.texture.height);
        this.cardModeAttributes.pivot.set(this.sprite.texture.width, this.sprite.texture.height);
        this.unitModeAttributes.position.set(this.sprite.texture.width, this.sprite.texture.height);
        this.unitModeAttributes.pivot.set(this.sprite.texture.width, this.sprite.texture.height);
        /* Card mode container */
        this.cardModeContainer = new PIXI.Container();
        this.cardModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power')));
        this.cardModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-name')));
        this.cardModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-description')));
        this.cardModeContainer.addChild(this.cardModeAttributes);
        internalContainer.addChild(this.cardModeContainer);
        /* Unit mode container */
        this.unitModeContainer = new PIXI.Container();
        this.unitModeContainer.addChild(this.unitModeAttributes);
        this.unitModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power-zoom')));
        internalContainer.addChild(this.unitModeContainer);
        /* Core container */
        this.coreContainer = new PIXI.Container();
        this.coreContainer.addChild(this.sprite);
        this.coreContainer.addChild(this.powerText);
        this.coreContainer.addChild(this.attackText);
        this.coreContainer.position.set(-1000, -1000);
        /* Card mode text container */
        this.cardModeTextContainer = new PIXI.Container();
        this.cardModeTextContainer.addChild(this.cardNameText);
        this.cardModeTextContainer.addChild(this.cardTitleText);
        this.cardModeTextContainer.addChild(this.cardDescriptionText);
        this.coreContainer.addChild(this.cardModeTextContainer);
    }
    getPosition() {
        return new PIXI.Point(this.hitboxSprite.position.x, this.hitboxSprite.position.y);
    }
    isHovered(mousePosition) {
        return this.hitboxSprite.containsPoint(mousePosition);
    }
    setPower(value) {
        this.power = value;
        this.powerText.text = value.toString();
    }
    setAttack(value) {
        this.attack = value;
        this.attackText.text = value.toString();
    }
    reveal(cardType, cardClass) {
        Core.unregisterCard(this);
        this.cardType = cardType;
        this.cardClass = cardClass;
        Core.registerCard(this);
    }
    createHitboxSprite(sprite) {
        const hitboxSprite = new PIXI.Sprite(sprite.texture);
        hitboxSprite.visible = false;
        hitboxSprite.anchor.set(0.5);
        hitboxSprite.tint = 0xAA5555;
        hitboxSprite.zIndex = -1;
        return hitboxSprite;
    }
    createPowerText(text) {
        const textObject = new ScalingText(text, new PIXI.TextStyle({
            fontFamily: 'BrushScript',
            fill: 0x000000,
            padding: 16
        }));
        textObject.anchor.set(0.5);
        return textObject;
    }
    createAttackText(text) {
        const textObject = new ScalingText(text, new PIXI.TextStyle({
            fontFamily: 'BrushScript',
            fill: 0x000000,
            padding: 16
        }));
        textObject.anchor.set(1.0, 0.5);
        return textObject;
    }
    createCardNameText(text) {
        const textObject = new ScalingText(text, new PIXI.TextStyle({
            fontFamily: Utils.getFont(text),
            fill: 0x000000,
            padding: 16,
            align: 'right'
        }));
        textObject.anchor.set(1, 0.5);
        return textObject;
    }
    setDisplayMode(displayMode) {
        if (this.displayMode === displayMode) {
            return;
        }
        this.displayMode = displayMode;
        if (displayMode === CardDisplayMode.IN_HAND || displayMode === CardDisplayMode.IN_HAND_HOVERED || displayMode === CardDisplayMode.INSPECTED) {
            this.switchToCardMode();
        }
        else if (displayMode === CardDisplayMode.ON_BOARD) {
            this.switchToUnitMode();
        }
        else if (displayMode === CardDisplayMode.IN_HAND_HIDDEN) {
            this.switchToHiddenMode();
        }
        const texts = [
            this.powerText,
            this.attackText,
            this.cardNameText,
            this.cardTitleText,
            this.cardDescriptionText
        ].filter(text => text.text.length > 0);
        texts.forEach(text => {
            text.position.x *= this.sprite.scale.x;
            text.position.y *= this.sprite.scale.y;
            text.position.x = Math.round(text.position.x);
            text.position.y = Math.round(text.position.y);
            let renderScale = Settings.generalFontRenderScale;
            if (this === Core.input.inspectedCard) {
                renderScale = 1.2;
            }
            else if (text === this.cardDescriptionText) {
                renderScale = Settings.descriptionFontRenderScale;
            }
            text.scale.set(1 / renderScale);
            text.style.fontSize *= this.sprite.scale.x * renderScale;
            text.style.lineHeight *= this.sprite.scale.x * renderScale;
        });
        this.powerText.position.x -= this.sprite.width / 2;
        this.powerText.position.y -= this.sprite.height / 2;
        this.attackText.position.x += this.sprite.width / 2;
        this.attackText.position.y += this.sprite.height / 2;
        this.cardNameText.position.x += this.sprite.width / 2;
        this.cardNameText.position.y -= this.sprite.height / 2;
        this.cardTitleText.position.x += this.sprite.width / 2;
        this.cardTitleText.position.y -= this.sprite.height / 2;
        this.cardDescriptionText.position.y += this.sprite.height / 2;
    }
    switchToCardMode() {
        this.unitModeContainer.visible = false;
        this.cardModeContainer.visible = true;
        this.cardModeTextContainer.visible = true;
        this.powerText.position.set(60, 45);
        this.powerText.style.fontSize = 71;
        this.attackText.position.copyFrom(this.cardModeAttributes.getAttackTextPosition());
        this.attackText.style.fontSize = this.cardModeAttributes.getAttackTextFontSize();
        this.cardNameText.position.set(-15, 67);
        this.cardNameText.style.fontSize = 22;
        if (this.cardTitleText.text.length > 0) {
            this.cardNameText.position.y -= 11;
            this.cardTitleText.position.set(-15, 81);
            this.cardTitleText.style.fontSize = 18;
        }
        this.cardDescriptionText.position.set(0, -135);
        const description = Localization.getString(this.cardDescription);
        let fontSize = 24;
        if (description.length > 50) {
            fontSize = 22;
        }
        if (description.length > 100) {
            fontSize = 20;
        }
        if (description.length > 150) {
            fontSize = 18;
        }
        if (description.length > 200) {
            fontSize = 16;
        }
        if (description.length > 250) {
            fontSize = 14;
        }
        this.cardDescriptionText.style.fontSize = fontSize;
        this.cardDescriptionText.style.baseFontSize = fontSize;
        this.cardDescriptionText.style.lineHeight = fontSize + 6;
    }
    switchToUnitMode() {
        this.unitModeContainer.visible = true;
        this.cardModeContainer.visible = false;
        this.cardModeTextContainer.visible = false;
        this.powerText.position.set(97, 80);
        this.powerText.style.fontSize = 135;
        this.attackText.position.copyFrom(this.unitModeAttributes.getAttackTextPosition());
        this.attackText.style.fontSize = this.unitModeAttributes.getAttackTextFontSize();
    }
    switchToHiddenMode() {
        this.cardModeContainer.visible = false;
        this.unitModeContainer.visible = false;
    }
    unregister() {
        Core.unregisterCard(this);
    }
    static fromMessage(message) {
        const card = new RenderedCard(message);
        Core.registerCard(card);
        return card;
    }
}
//# sourceMappingURL=RenderedCard.js.map