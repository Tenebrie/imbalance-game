import Core from '@/Pixi/Core';
import CardType from '@/shared/enums/CardType';
import HoveredCard from '@/Pixi/models/HoveredCard';
import GrabbedCard from '@/Pixi/models/GrabbedCard';
import { CardLocation } from '@/Pixi/enums/CardLocation';
import { TargetingMode } from '@/Pixi/enums/TargetingMode';
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers';
import GameTurnPhase from '@/shared/enums/GameTurnPhase';
var Point = PIXI.Point;
export default class Input {
    constructor() {
        this.mouseDown = false;
        this.mousePosition = new Point(-10000, -10000);
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
        if (event.button !== 0) {
            return;
        }
        this.mouseDown = true;
        this.grabCard();
    }
    onMouseUp(event) {
        if (this.inspectedCard) {
            this.inspectedCard = null;
            return;
        }
        if (event.button === 2 && this.hoveredCard) {
            this.inspectedCard = this.hoveredCard.card;
        }
        if (event.button === 0) {
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
            targeting = TargetingMode.CARD_ATTACK;
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
        else if (this.grabbedCard.targetingMode === TargetingMode.CARD_ATTACK) {
            this.onCardAttack(this.grabbedCard.card);
        }
        this.releaseCard();
    }
    releaseCard() {
        const grabbedCard = this.grabbedCard;
        grabbedCard.targetingArrow.destroy();
        this.hoveredCard = null;
        this.grabbedCard = null;
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
            OutgoingMessageHandlers.sendUnitCardPlayed(card, hoveredRow, hoveredRow.cards.length);
        }
    }
    onCardAttack(card) {
        const hoveredCard = this.hoveredCard;
        if (!hoveredCard || hoveredCard.owner === Core.player) {
            return;
        }
        OutgoingMessageHandlers.sendUnitAttackOrder(card, hoveredCard.card);
    }
    onMouseMove(event) {
        const view = Core.renderer.pixi.view;
        const clientRect = view.getBoundingClientRect();
        this.mousePosition = new Point(event.clientX - clientRect.left, event.clientY - clientRect.top);
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