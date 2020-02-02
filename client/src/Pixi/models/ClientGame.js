import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase';
export default class ClientGame {
    constructor() {
        this.currentTime = 0;
        this.maximumTime = 1;
        this.turnPhase = GameTurnPhase.BEFORE_GAME;
    }
    setTurnPhase(phase) {
        this.turnPhase = phase;
    }
}
//# sourceMappingURL=ClientGame.js.map