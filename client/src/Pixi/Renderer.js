import Core from '@/Pixi/Core';
import * as PIXI from 'pixi.js';
import Constants from '@/shared/Constants';
import { TargetingMode } from '@/Pixi/enums/TargetingMode';
import GameTurnPhase from '@/shared/enums/GameTurnPhase';
import CardType from '@/shared/enums/CardType';
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode';
const UNIT_ZINDEX = 2;
const HOVERED_CARD_ZINDEX = 50;
const GRABBED_CARD_ZINDEX = 150;
const INSPECTED_CARD_ZINDEX = 200;
export default class Renderer {
    constructor(container) {
        this.SSAA_FACTOR = 1;
        this.CARD_ASPECT_RATIO = 408 / 584;
        this.GAME_BOARD_WINDOW_FRACTION = 0.6;
        this.PLAYER_HAND_WINDOW_FRACTION = 0.20;
        this.OPPONENT_HAND_WINDOW_FRACTION = 0.10;
        this.HOVERED_HAND_WINDOW_FRACTION = 0.3;
        this.GAME_BOARD_OFFSET_FRACTION = -0.05;
        this.GAME_BOARD_ROW_WINDOW_FRACTION = this.GAME_BOARD_WINDOW_FRACTION / Constants.GAME_BOARD_ROW_COUNT;
        this.pixi = new PIXI.Application({
            width: window.innerWidth * window.devicePixelRatio * this.SSAA_FACTOR,
            height: window.innerHeight * window.devicePixelRatio * this.SSAA_FACTOR,
            antialias: false,
            autoDensity: true,
            resolution: 1
        });
        this.pixi.stage.sortableChildren = true;
        this.pixi.view.style.maxWidth = '100vw';
        this.pixi.view.style.maxHeight = '100vh';
        container.appendChild(this.pixi.view);
        this.container = container;
        /* Time label */
        this.timeLabel = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 24 * this.SSAA_FACTOR,
            fill: 0xFFFFFF
        });
        this.timeLabel.anchor.set(0, 0.5);
        this.timeLabel.position.set(10, this.getScreenHeight() / 2);
        this.pixi.stage.addChild(this.timeLabel);
        /* Action label */
        this.actionLabel = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 24 * this.SSAA_FACTOR,
            fill: 0xFFFFFF
        });
        this.actionLabel.anchor.set(0.5, 1);
        this.actionLabel.zIndex = 85;
        this.pixi.stage.addChild(this.actionLabel);
        /* Player name label */
        this.playerNameLabel = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 24 * this.SSAA_FACTOR,
            fill: 0xFFFFFF
        });
        this.playerNameLabel.anchor.set(0, 1);
        this.playerNameLabel.position.set(10, this.getScreenHeight() - 10);
        this.pixi.stage.addChild(this.playerNameLabel);
        /* Opponent player name */
        this.opponentNameLabel = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 24 * this.SSAA_FACTOR,
            fill: 0xFFFFFF
        });
        this.opponentNameLabel.position.set(10, 10);
        this.pixi.stage.addChild(this.opponentNameLabel);
        /* Register the ticker */
        PIXI.Ticker.shared.add(() => this.tick());
    }
    tick() {
        const playerCards = Core.player.cardHand.cards;
        const sortedPlayerCards = Core.player.cardHand.cards.slice().reverse();
        sortedPlayerCards.forEach(renderedCard => {
            if (renderedCard === Core.input.inspectedCard) {
                return;
            }
            if (Core.input.grabbedCard && renderedCard === Core.input.grabbedCard.card) {
                this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length, false);
                const displayMode = this.renderGrabbedCard(renderedCard, Core.input.mousePosition);
                renderedCard.setDisplayMode(displayMode);
            }
            else if (!Core.input.grabbedCard && Core.input.hoveredCard && renderedCard === Core.input.hoveredCard.card) {
                this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length, false);
                this.renderHoveredCardInHand(renderedCard);
                renderedCard.setDisplayMode(CardDisplayMode.IN_HAND_HOVERED);
            }
            else {
                this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length, false);
                renderedCard.setDisplayMode(CardDisplayMode.IN_HAND);
            }
        });
        if (Core.opponent) {
            const opponentCards = Core.opponent.cardHand.cards;
            const sortedOpponentCards = Core.opponent.cardHand.cards.slice().reverse();
            sortedOpponentCards.forEach(renderedCard => {
                if (renderedCard === Core.input.inspectedCard) {
                    return;
                }
                this.renderCardInHand(renderedCard, opponentCards.indexOf(renderedCard), opponentCards.length, true);
                renderedCard.setDisplayMode(CardDisplayMode.IN_HAND_HIDDEN);
            });
        }
        this.renderTextLabels();
        this.renderGameBoard(Core.board);
        this.renderTargetingArrow();
        this.renderQueuedAttacks();
        this.renderInspectedCard();
    }
    registerButton(button) {
        this.pixi.stage.addChild(button.container);
    }
    unregisterButton(button) {
        this.pixi.stage.removeChild(button.container);
    }
    registerCard(card) {
        this.pixi.stage.addChild(card.coreContainer);
        this.pixi.stage.addChild(card.hitboxSprite);
    }
    unregisterCard(card) {
        this.pixi.stage.removeChild(card.coreContainer);
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
    renderCardInHand(renderedCard, handPosition, handSize, isOpponent) {
        const container = renderedCard.coreContainer;
        const sprite = renderedCard.sprite;
        const hitboxSprite = renderedCard.hitboxSprite;
        const windowFraction = isOpponent ? this.OPPONENT_HAND_WINDOW_FRACTION : this.PLAYER_HAND_WINDOW_FRACTION;
        const cardHeight = this.getScreenHeight() * windowFraction;
        sprite.width = cardHeight * this.CARD_ASPECT_RATIO;
        sprite.height = cardHeight;
        const screenCenter = this.getScreenWidth() / 2;
        const cardWidth = cardHeight * this.CARD_ASPECT_RATIO * Math.pow(0.95, handSize);
        const distanceToCenter = handPosition - ((handSize - 1) / 2);
        container.position.x = distanceToCenter * cardWidth + screenCenter;
        container.position.y = cardHeight * 0.5;
        container.zIndex = (handPosition + 1) * 2;
        if (!isOpponent) {
            container.position.y = this.getScreenHeight() - container.position.y;
        }
        hitboxSprite.position.set(container.position.x + sprite.position.x, container.position.y + sprite.position.y);
        hitboxSprite.scale = sprite.scale;
        hitboxSprite.zIndex = container.zIndex - 1;
    }
    renderHoveredCardInHand(renderedCard) {
        const container = renderedCard.coreContainer;
        const sprite = renderedCard.sprite;
        const cardHeight = this.getScreenHeight() * this.HOVERED_HAND_WINDOW_FRACTION;
        sprite.width = cardHeight * this.CARD_ASPECT_RATIO;
        sprite.height = cardHeight;
        container.position.y = cardHeight * 0.5;
        container.position.y = this.getScreenHeight() - container.position.y;
        container.zIndex = HOVERED_CARD_ZINDEX;
    }
    renderGrabbedCard(renderedCard, mousePosition) {
        const container = renderedCard.coreContainer;
        const sprite = renderedCard.sprite;
        const hoveredRow = Core.board.rows.find(row => row.isHovered(Core.input.mousePosition));
        let cardDisplayMode;
        if (renderedCard.cardType === CardType.UNIT && hoveredRow) {
            const cardHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION;
            sprite.width = cardHeight * this.CARD_ASPECT_RATIO;
            sprite.height = cardHeight;
            cardDisplayMode = CardDisplayMode.ON_BOARD;
        }
        else {
            cardDisplayMode = CardDisplayMode.IN_HAND;
        }
        container.position.x = mousePosition.x;
        container.position.y = mousePosition.y;
        container.zIndex = GRABBED_CARD_ZINDEX;
        return cardDisplayMode;
    }
    renderTextLabels() {
        let phaseLabel = '';
        if (Core.game.turnPhase === GameTurnPhase.BEFORE_GAME) {
            phaseLabel = 'Waiting for the game to start';
        }
        else if (Core.game.turnPhase === GameTurnPhase.AFTER_GAME) {
            phaseLabel = 'Game finished!';
        }
        else {
            let phase = 'Unknown';
            if (Core.game.turnPhase === GameTurnPhase.TURN_START || Core.game.turnPhase === GameTurnPhase.DEPLOY || Core.game.turnPhase === GameTurnPhase.TURN_END) {
                phase = 'Deploy';
            }
            else if (Core.game.turnPhase === GameTurnPhase.SKIRMISH) {
                phase = 'Skirmish';
            }
            else if (Core.game.turnPhase === GameTurnPhase.COMBAT) {
                phase = 'Combat';
            }
            phaseLabel = `Turn phase is ${phase}`;
        }
        this.timeLabel.text = `${phaseLabel}\nTime of day is ${Core.game.currentTime} out of ${Core.game.maximumTime}`;
        /* Player name labels */
        this.playerNameLabel.text = `${Core.player.player.username}\nTime units available: ${Core.player.timeUnits}`;
        if (Core.opponent) {
            this.opponentNameLabel.text = `${Core.opponent.player.username}\nTime units available: ${Core.opponent.timeUnits}`;
        }
        /* Action label */
        const labelPosition = Core.input.mousePosition.clone();
        labelPosition.y -= 16;
        this.actionLabel.position.copyFrom(labelPosition);
    }
    renderGameBoard(gameBoard) {
        let rows = gameBoard.rows.slice();
        if (gameBoard.isInverted) {
            rows = rows.reverse();
        }
        for (let i = 0; i < rows.length; i++) {
            this.renderGameBoardRow(rows[i], i);
        }
    }
    renderGameBoardRow(gameBoardRow, rowIndex) {
        const sprite = gameBoardRow.sprite;
        const rowHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION;
        sprite.scale.set(rowHeight / sprite.texture.height);
        const screenCenterX = this.getScreenWidth() / 2;
        const screenCenterY = this.getScreenHeight() / 2;
        const verticalDistanceToCenter = rowIndex - Constants.GAME_BOARD_ROW_COUNT / 2 + 0.5;
        const rowY = screenCenterY + verticalDistanceToCenter * rowHeight + this.getScreenHeight() * this.GAME_BOARD_OFFSET_FRACTION;
        sprite.alpha = 1;
        sprite.position.set(screenCenterX, rowY);
        for (let i = 0; i < gameBoardRow.cards.length; i++) {
            const cardOnBoard = gameBoardRow.cards[i];
            this.renderCardOnBoard(cardOnBoard, rowY, i, gameBoardRow.cards.length);
        }
    }
    renderCardOnBoard(cardOnBoard, rowY, unitIndex, unitCount) {
        if (cardOnBoard.card === Core.input.inspectedCard) {
            return;
        }
        const container = cardOnBoard.card.coreContainer;
        const sprite = cardOnBoard.card.sprite;
        const hitboxSprite = cardOnBoard.card.hitboxSprite;
        const screenCenterX = this.getScreenWidth() / 2;
        const distanceToCenter = unitIndex - unitCount / 2 + 0.5;
        const cardHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION;
        const cardWidth = cardHeight * this.CARD_ASPECT_RATIO;
        container.position.x = screenCenterX + distanceToCenter * cardWidth;
        container.position.y = rowY;
        container.zIndex = UNIT_ZINDEX;
        sprite.width = cardHeight * this.CARD_ASPECT_RATIO;
        sprite.height = cardHeight;
        sprite.tint = 0xFFFFFF;
        if (Core.input.hoveredCard && cardOnBoard.card === Core.input.hoveredCard.card) {
            sprite.tint = 0xBFBFBF;
        }
        if (Core.game.turnPhase === GameTurnPhase.SKIRMISH && cardOnBoard.owner === Core.player) {
            sprite.tint = 0xBBFFBB;
            if (Core.input.grabbedCard && cardOnBoard.card === Core.input.grabbedCard.card) {
                sprite.tint = 0x99BB99;
            }
            else if (Core.input.hoveredCard && cardOnBoard.card === Core.input.hoveredCard.card) {
                sprite.tint = 0x4CFE4C;
            }
        }
        hitboxSprite.position.set(container.position.x + sprite.position.x, container.position.y + sprite.position.y);
        hitboxSprite.scale = sprite.scale;
        hitboxSprite.zIndex = container.zIndex - 1;
        cardOnBoard.card.setDisplayMode(CardDisplayMode.ON_BOARD);
    }
    renderTargetingArrow() {
        const grabbedCard = Core.input.grabbedCard;
        if (!grabbedCard || grabbedCard.targetingMode !== TargetingMode.CARD_ATTACK) {
            this.actionLabel.text = '';
            return;
        }
        const targetingArrow = grabbedCard.targetingArrow;
        const startingPosition = grabbedCard.card.hitboxSprite.position;
        const targetPosition = Core.input.mousePosition;
        targetingArrow.startingPoint.position.copyFrom(startingPosition);
        targetingArrow.startingPoint.clear();
        targetingArrow.startingPoint.beginFill(0xFFFF00, 1.0);
        targetingArrow.startingPoint.drawCircle(0, 0, 5);
        targetingArrow.startingPoint.endFill();
        targetingArrow.startingPoint.zIndex = 80;
        targetingArrow.arrowLine.position.copyFrom(startingPosition);
        targetingArrow.arrowLine.clear();
        const iterations = 5;
        for (let i = 0; i < iterations; i++) {
            targetingArrow.arrowLine.lineStyle(i + 1, 0xFFFF00, (iterations + 1 - i) / (iterations + 1));
            targetingArrow.arrowLine.lineTo(targetPosition.x - startingPosition.x, targetPosition.y - startingPosition.y);
            targetingArrow.arrowLine.moveTo(0, 0);
        }
        targetingArrow.arrowLine.lineStyle(2, 0xFFFF00, 0.8);
        targetingArrow.arrowLine.lineTo(targetPosition.x - startingPosition.x, targetPosition.y - startingPosition.y);
        targetingArrow.arrowLine.zIndex = 80;
        targetingArrow.targetPoint.position.copyFrom(targetPosition);
        targetingArrow.targetPoint.clear();
        targetingArrow.targetPoint.beginFill(0xFFFF00, 1.0);
        targetingArrow.targetPoint.drawCircle(0, 0, 5);
        targetingArrow.targetPoint.endFill();
        targetingArrow.targetPoint.zIndex = 80;
        if (Core.input.hoveredCard && Core.input.hoveredCard.owner !== Core.player) {
            this.actionLabel.text = 'Attack';
        }
        else {
            this.actionLabel.text = '';
        }
    }
    renderQueuedAttacks() {
        Core.board.queuedAttacks.forEach(attack => {
            const targetingArrow = attack.targetingArrow;
            const startingPosition = attack.attacker.card.getPosition();
            const targetPosition = attack.target.card.getPosition();
            targetingArrow.startingPoint.position.copyFrom(startingPosition);
            targetingArrow.startingPoint.clear();
            targetingArrow.startingPoint.beginFill(0x999999, 1.0);
            targetingArrow.startingPoint.drawCircle(0, 0, 5);
            targetingArrow.startingPoint.endFill();
            targetingArrow.startingPoint.zIndex = 75;
            targetingArrow.arrowLine.position.copyFrom(startingPosition);
            targetingArrow.arrowLine.clear();
            targetingArrow.arrowLine.lineStyle(2, 0x999999, 1.0);
            targetingArrow.arrowLine.lineTo(targetPosition.x - startingPosition.x, targetPosition.y - startingPosition.y);
            targetingArrow.arrowLine.zIndex = 75;
            targetingArrow.targetPoint.position.copyFrom(targetPosition);
            targetingArrow.targetPoint.clear();
            targetingArrow.targetPoint.beginFill(0x999999, 1.0);
            targetingArrow.targetPoint.drawCircle(0, 0, 5);
            targetingArrow.targetPoint.endFill();
            targetingArrow.targetPoint.zIndex = 75;
        });
    }
    renderInspectedCard() {
        const inspectedCard = Core.input.inspectedCard;
        if (!inspectedCard) {
            return;
        }
        const container = inspectedCard.coreContainer;
        const sprite = inspectedCard.sprite;
        sprite.tint = 0xFFFFFF;
        sprite.scale.set(1);
        container.position.x = this.getScreenWidth() / 2;
        container.position.y = this.getScreenHeight() / 2;
        container.zIndex = INSPECTED_CARD_ZINDEX;
        inspectedCard.setDisplayMode(CardDisplayMode.INSPECTED);
    }
    destroy() {
        this.pixi.stop();
        this.container.removeChild(this.pixi.view);
    }
}
//# sourceMappingURL=Renderer.js.map