import Core from '@/Pixi/Core';
import * as PIXI from 'pixi.js';
import CardType from '@/Pixi/shared/enums/CardType';
import HoveredCard from '@/Pixi/models/HoveredCard';
import GrabbedCard from '@/Pixi/models/GrabbedCard';
import { CardLocation } from '@/Pixi/enums/CardLocation';
import { TargetingMode } from '@/Pixi/enums/TargetingMode';
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers';
import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase';
import AttackOrder from '@/Pixi/shared/models/AttackOrder';
import MoveOrder from './shared/models/MoveOrder';
const LEFT_MOUSE_BUTTON = 0;
const RIGHT_MOUSE_BUTTON = 2;
export default class Input {
    constructor() {
        this.mouseDown = false;
        this.mousePosition = new PIXI.Point(-10000, -10000);
        this.hoveredCard = null;
        this.grabbedCard = null;
        this.inspectedCard = null;
        const view = Core.renderer.pixi.view;
        view.addEventListener('mousedown', (event) => {
            this.onMouseDown(event);
        });
        view.addEventListener('mouseup', (event) => {
            this.onMouseUp(event);
        });
        view.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
        view.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            return false;
        });
    }
    updateCardHoverStatus() {
        const gameBoardCards = Core.board.rows.map(row => row.cards).flat();
        const playerHandCards = Core.player.cardHand.cards.slice().reverse();
        let hoveredCard = null;
        const hoveredCardOnBoard = gameBoardCards.find(cardOnBoard => cardOnBoard.card.isHovered(this.mousePosition)) || null;
        if (hoveredCardOnBoard) {
            hoveredCard = HoveredCard.fromCardOnBoard(hoveredCardOnBoard);
        }
        const hoveredCardInHand = playerHandCards.find(card => card.isHovered(this.mousePosition)) || null;
        if (hoveredCardInHand) {
            hoveredCard = HoveredCard.fromCardInHand(hoveredCardInHand, Core.player);
        }
        this.hoveredCard = hoveredCard;
    }
    onMouseDown(event) {
        if (this.inspectedCard) {
            return;
        }
        if (event.button === RIGHT_MOUSE_BUTTON && this.grabbedCard) {
            this.releaseCard();
            return;
        }
        if (event.button !== LEFT_MOUSE_BUTTON) {
            return;
        }
        const buttons = Core.userInterface.buttons;
        const pressedButton = buttons.find(button => button.isHovered(this.mousePosition));
        if (pressedButton) {
            Core.userInterface.pressedButton = pressedButton;
            return;
        }
        this.mouseDown = true;
        this.grabCard();
    }
    onMouseUp(event) {
        if (this.inspectedCard) {
            this.inspectedCard = null;
            if (event.button === RIGHT_MOUSE_BUTTON && this.hoveredCard) {
                this.inspectedCard = this.hoveredCard.card;
            }
            return;
        }
        const pressedButton = Core.userInterface.pressedButton;
        if (pressedButton) {
            if (pressedButton.isHovered(this.mousePosition)) {
                pressedButton.onClick();
            }
            Core.userInterface.pressedButton = null;
            return;
        }
        if (event.button === RIGHT_MOUSE_BUTTON && this.hoveredCard) {
            this.inspectedCard = this.hoveredCard.card;
        }
        if (event.button === LEFT_MOUSE_BUTTON) {
            this.mouseDown = false;
            this.useGrabbedCard();
        }
    }
    grabCard() {
        const hoveredCard = this.hoveredCard;
        if (!hoveredCard) {
            return;
        }
        let targeting;
        if (hoveredCard.location === CardLocation.HAND && hoveredCard.owner === Core.player) {
            targeting = TargetingMode.CARD_PLAY;
        }
        else if (hoveredCard.location === CardLocation.BOARD && hoveredCard.owner === Core.player && Core.game.turnPhase === GameTurnPhase.SKIRMISH) {
            targeting = TargetingMode.CARD_ORDER;
        }
        else {
            return;
        }
        this.grabbedCard = new GrabbedCard(hoveredCard.card, targeting);
    }
    useGrabbedCard() {
        if (!this.grabbedCard) {
            return;
        }
        if (this.grabbedCard.targetingMode === TargetingMode.CARD_PLAY) {
            this.onCardPlay(this.grabbedCard.card);
        }
        else if (this.grabbedCard.targetingMode === TargetingMode.CARD_ORDER) {
            this.onCardOrder(this.grabbedCard.card);
        }
        this.releaseCard();
    }
    releaseCard() {
        const grabbedCard = this.grabbedCard;
        grabbedCard.targetingArrow.destroy();
        this.grabbedCard = null;
        this.updateCardHoverStatus();
    }
    getCardInsertIndex(hoveredRow) {
        const hoveredUnit = this.hoveredCard;
        if (!hoveredUnit || !hoveredRow.includesCard(hoveredUnit.card)) {
            return this.mousePosition.x > hoveredRow.container.position.x ? hoveredRow.cards.length : 0;
        }
        let index = hoveredRow.getCardIndex(hoveredUnit.card);
        if (this.mousePosition.x > hoveredUnit.card.hitboxSprite.position.x) {
            index += 1;
        }
        return index;
    }
    onCardPlay(card) {
        const hoveredRow = Core.board.rows.find(row => row.isHovered(this.mousePosition));
        if (!hoveredRow) {
            return;
        }
        if (card.cardType === CardType.SPELL) {
            OutgoingMessageHandlers.sendSpellCardPlayed(card);
        }
        else if (card.cardType === CardType.UNIT) {
            OutgoingMessageHandlers.sendUnitCardPlayed(card, hoveredRow, this.getCardInsertIndex(hoveredRow));
        }
    }
    onCardOrder(orderedCard) {
        const hoveredCard = this.hoveredCard;
        const orderedUnit = Core.board.findUnitById(orderedCard.id);
        if (hoveredCard && hoveredCard.owner !== Core.player) {
            OutgoingMessageHandlers.sendUnitAttackOrders(new AttackOrder(orderedUnit, hoveredCard));
            return;
        }
        const hoveredRow = Core.board.rows.find(row => row.isHovered(this.mousePosition));
        if (hoveredRow && orderedUnit.rowIndex !== hoveredRow.index) {
            const distance = Math.abs(orderedUnit.rowIndex - hoveredRow.index);
            const maxMoveDistance = 1;
            if (distance <= maxMoveDistance) {
                OutgoingMessageHandlers.sendUnitMoveOrders(new MoveOrder(orderedUnit, hoveredRow));
            }
            else {
                console.log(hoveredRow.index);
            }
        }
    }
    onMouseMove(event) {
        const view = Core.renderer.pixi.view;
        const clientRect = view.getBoundingClientRect();
        this.mousePosition = new PIXI.Point(event.clientX - clientRect.left, event.clientY - clientRect.top);
        this.mousePosition.x *= window.devicePixelRatio * Core.renderer.SSAA_FACTOR;
        this.mousePosition.y *= window.devicePixelRatio * Core.renderer.SSAA_FACTOR;
        const windowHeight = Core.renderer.pixi.view.height;
        if (this.grabbedCard && this.grabbedCard.targetingMode === TargetingMode.CARD_PLAY && Core.player.timeUnits === 0 && windowHeight - this.mousePosition.y > windowHeight * Core.renderer.PLAYER_HAND_WINDOW_FRACTION * 1.5) {
            this.releaseCard();
        }
    }
    clear() {
        // TODO: Remove event listeners
    }
}
//# sourceMappingURL=Input.js.map