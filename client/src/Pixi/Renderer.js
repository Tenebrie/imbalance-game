import Core from '@/Pixi/Core';
import * as PIXI from 'pixi.js';
import Constants from '@/shared/Constants';
const CARD_SCALE = 0.3;
const HOVERED_CARD_SCALE = 0.7;
export default class Renderer {
    constructor(container) {
        this.pixi = new PIXI.Application({ width: 1024, height: 1024 });
        this.pixi.stage.sortableChildren = true;
        container.appendChild(this.pixi.view);
        this.container = container;
        PIXI.Ticker.shared.add(() => this.tick());
    }
    tick() {
        const playerCards = Core.player.cardHand.cards;
        const sortedPlayerCards = Core.player.cardHand.cards.slice().reverse();
        sortedPlayerCards.forEach(renderedCard => {
            if (renderedCard === Core.input.grabbedCard) {
                this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length);
                this.renderGrabbedCard(renderedCard, Core.input.mousePosition);
            }
            else if (renderedCard === Core.input.hoveredCard) {
                this.renderHoveredCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length);
            }
            else {
                this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length);
            }
        });
        if (Core.opponent) {
            const opponentCards = Core.opponent.cardHand.cards;
            const sortedOpponentCards = Core.opponent.cardHand.cards.slice().reverse();
            sortedOpponentCards.forEach(renderedCard => {
                this.renderCardInOpponentHand(renderedCard, opponentCards.indexOf(renderedCard), opponentCards.length);
            });
        }
        this.renderGameBoard(Core.gameBoard);
    }
    registerCard(card) {
        this.pixi.stage.addChild(card.sprite);
        this.pixi.stage.addChild(card.hitboxSprite);
    }
    unregisterCard(card) {
        this.pixi.stage.removeChild(card.sprite);
        this.pixi.stage.removeChild(card.hitboxSprite);
    }
    registerGameBoardRow(row) {
        this.pixi.stage.addChild(row.sprite);
    }
    getScreenWidth() {
        return this.pixi.view.width;
    }
    getScreenHeight() {
        return this.pixi.view.height;
    }
    renderSpriteInHand(sprite, handPosition, handSize, isOpponent) {
        sprite.scale.set(CARD_SCALE);
        const screenCenter = this.getScreenWidth() / 2;
        const cardWidth = sprite.width * Math.pow(0.95, handSize);
        const cardHeight = sprite.height * 0.5;
        const distanceToCenter = handPosition - ((handSize - 1) / 2);
        sprite.alpha = 1;
        sprite.position.x = distanceToCenter * cardWidth + screenCenter;
        sprite.position.y = cardHeight;
        sprite.rotation = 0;
        sprite.zIndex = (handPosition + 1) * 2;
        if (!isOpponent) {
            sprite.position.y = this.getScreenHeight() - sprite.position.y;
        }
    }
    renderHoveredSpriteInHand(sprite, handPosition, handSize) {
        sprite.scale.set(CARD_SCALE);
        const screenCenter = this.getScreenWidth() / 2;
        const cardWidth = sprite.width * Math.pow(0.95, handSize);
        const cardHeight = (sprite.height / CARD_SCALE) * HOVERED_CARD_SCALE * 0.5;
        const distanceToCenter = handPosition - ((handSize - 1) / 2);
        sprite.alpha = 1;
        sprite.scale.set(HOVERED_CARD_SCALE);
        sprite.position.x = distanceToCenter * cardWidth + screenCenter;
        sprite.position.y = this.getScreenHeight() - cardHeight;
        sprite.rotation = 0;
        sprite.zIndex = 50;
    }
    renderGrabbedSprite(sprite, mousePosition) {
        sprite.alpha = 1;
        sprite.scale.set(CARD_SCALE);
        sprite.position.x = mousePosition.x;
        sprite.position.y = mousePosition.y;
        sprite.rotation = 0;
        sprite.zIndex = 100;
    }
    renderCardInHand(renderedCard, handPosition, handSize) {
        const sprite = renderedCard.sprite;
        const hitboxSprite = renderedCard.hitboxSprite;
        this.renderSpriteInHand(sprite, handPosition, handSize, false);
        this.renderSpriteInHand(hitboxSprite, handPosition, handSize, false);
        hitboxSprite.zIndex -= 1;
    }
    renderHoveredCardInHand(renderedCard, handPosition, handSize) {
        const sprite = renderedCard.sprite;
        const hitboxSprite = renderedCard.hitboxSprite;
        this.renderHoveredSpriteInHand(sprite, handPosition, handSize);
        this.renderSpriteInHand(hitboxSprite, handPosition, handSize, false);
        hitboxSprite.zIndex -= 1;
    }
    renderGrabbedCard(renderedCard, mousePosition) {
        this.renderGrabbedSprite(renderedCard.sprite, mousePosition);
    }
    renderCardInOpponentHand(renderedCard, handPosition, handSize) {
        const sprite = renderedCard.sprite;
        const hitboxSprite = renderedCard.hitboxSprite;
        this.renderSpriteInHand(sprite, handPosition, handSize, true);
        this.renderSpriteInHand(hitboxSprite, handPosition, handSize, true);
        hitboxSprite.zIndex -= 1;
    }
    renderGameBoard(gameBoard) {
        const rows = gameBoard.rows;
        for (let i = 0; i < rows.length; i++) {
            this.renderGameBoardRow(rows[i], i);
        }
    }
    renderGameBoardRow(gameBoardRow, rowIndex) {
        const sprite = gameBoardRow.sprite;
        const screenCenterX = this.getScreenWidth() / 2;
        const screenCenterY = this.getScreenHeight() / 2;
        const rowHeight = gameBoardRow.sprite.height;
        const verticalDistanceToCenter = rowIndex - Constants.GAME_BOARD_ROW_COUNT / 2;
        sprite.alpha = 1;
        sprite.position.set(screenCenterX, screenCenterY + verticalDistanceToCenter * rowHeight);
    }
    destroy() {
        this.pixi.stop();
        this.container.removeChild(this.pixi.view);
    }
}
//# sourceMappingURL=Renderer.js.map