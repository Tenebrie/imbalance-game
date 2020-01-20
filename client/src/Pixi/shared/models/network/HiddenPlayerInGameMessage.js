import PlayerMessage from './PlayerMessage';
import HiddenCardHandMessage from './HiddenCardHandMessage';
import HiddenCardDeckMessage from './HiddenCardDeckMessage';
export default class HiddenPlayerInGameMessage {
    constructor(playerInGame) {
        this.player = PlayerMessage.fromPlayer(playerInGame.player);
        this.cardHand = HiddenCardHandMessage.fromHand(playerInGame.cardHand);
        this.cardDeck = HiddenCardDeckMessage.fromDeck(playerInGame.cardDeck);
        this.morale = playerInGame.morale;
        this.timeUnits = playerInGame.timeUnits;
    }
    static fromPlayerInGame(playerInGame) {
        return new HiddenPlayerInGameMessage(playerInGame);
    }
}
//# sourceMappingURL=HiddenPlayerInGameMessage.js.map