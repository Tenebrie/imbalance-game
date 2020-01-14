import GameTurnPhase from '@/shared/enums/GameTurnPhase';
export default class ClientGame {
    constructor() {
        this.currentTime = 0;
        this.maximumTime = 1;
        this.turnPhase = GameTurnPhase.DEPLOY;
    }
}
//# sourceMappingURL=ClientGame.js.map