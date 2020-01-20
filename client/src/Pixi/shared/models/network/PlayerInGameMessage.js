import PlayerMessage from './PlayerMessage';
import CardHandMessage from './CardHandMessage';
import CardDeckMessage from './CardDeckMessage';
export default class PlayerInGameMessage {
    constructor(playerInGame) {
        this.player = PlayerMessage.fromPlayer(playerInGame.player);
        this.cardHand = CardHandMessage.fromHand(playerInGame.cardHand);
        this.cardDeck = CardDeckMessage.fromDeck(playerInGame.cardDeck);
        this.morale = playerInGame.morale;
        this.timeUnits = playerInGame.timeUnits;
    }
    static fromPlayerInGame(playerInGame) {
        return new PlayerInGameMessage(playerInGame);
    }
}
//# sourceMappingURL=PlayerInGameMessage.js.map