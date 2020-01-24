import Core from '@/Pixi/Core';
import store from '@/Vue/store';
import Player from '@/Pixi/shared/models/Player';
import PlayerInGame from '@/Pixi/shared/models/PlayerInGame';
import RenderedCardHand from '@/Pixi/models/RenderedCardHand';
import ClientCardDeck from '@/Pixi/models/ClientCardDeck';
export default class ClientPlayerInGame extends PlayerInGame {
    constructor(player) {
        super(player);
        this.isTurnActive = false;
        this.cardHand = new RenderedCardHand([]);
        this.cardDeck = new ClientCardDeck([]);
    }
    startTurn() {
        this.isTurnActive = true;
        if (this === Core.player) {
            store.commit.gameStateModule.setIsPlayersTurn(true);
        }
    }
    endTurn() {
        this.isTurnActive = false;
        if (this === Core.player) {
            store.commit.gameStateModule.setIsPlayersTurn(false);
        }
    }
    static fromPlayer(player) {
        return new ClientPlayerInGame(player);
    }
    static fromMessage(message) {
        const player = Player.fromPlayerMessage(message.player);
        const clientPlayerInGame = new ClientPlayerInGame(player);
        clientPlayerInGame.cardHand = RenderedCardHand.fromMessage(message.cardHand);
        clientPlayerInGame.cardDeck = ClientCardDeck.fromMessage(message.cardDeck);
        clientPlayerInGame.morale = message.morale;
        clientPlayerInGame.timeUnits = message.timeUnits;
        return clientPlayerInGame;
    }
}
//# sourceMappingURL=ClientPlayerInGame.js.map