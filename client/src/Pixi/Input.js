import Core from '@/Pixi/Core';
import * as PIXI from 'pixi.js';
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers';
var Point = PIXI.Point;
export default class Input {
    constructor() {
        this.mouseDown = false;
        this.mousePosition = new Point();
        this.hoveredCard = null;
        this.grabbedCard = null;
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
    }
    onMouseDown(event) {
        this.mouseDown = true;
        this.grabCard();
    }
    onMouseUp(event) {
        this.mouseDown = false;
        this.releaseCard();
    }
    grabCard() {
        if (!this.hoveredCard) {
            return;
        }
        this.grabbedCard = this.hoveredCard;
    }
    releaseCard() {
        if (!this.grabbedCard) {
            return;
        }
        if (Core.gameBoard.isHovered(this.mousePosition)) {
            OutgoingMessageHandlers.sendSpellCardPlayed(this.grabbedCard);
        }
        this.hoveredCard = null;
        this.grabbedCard = null;
    }
    onMouseMove(event) {
        const view = Core.renderer.pixi.view;
        const clientRect = view.getBoundingClientRect();
        this.mousePosition = new Point(event.clientX - clientRect.left, event.clientY - clientRect.top);
    }
    clear() {
    }
}
//# sourceMappingURL=Input.js.map