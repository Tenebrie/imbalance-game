import Player from '@/shared/models/Player';
import PlayerInGame from '@/shared/models/PlayerInGame';
import RenderedCardHand from '@/Pixi/models/RenderedCardHand';
import ClientCardDeck from '@/Pixi/models/ClientCardDeck';
export default class ClientPlayerInGame extends PlayerInGame {
    constructor(player) {
        super(player);
        this.cardHand = new RenderedCardHand([]);
        this.cardDeck = new ClientCardDeck([]);
    }
    static fromPlayer(player) {
        return new ClientPlayerInGame(player);
    }
    static fromMessage(message) {
        const player = Player.fromPlayerMessage(message.player);
        const clientPlayerInGame = new ClientPlayerInGame(player);
        clientPlayerInGame.cardHand = RenderedCardHand.fromMessage(message.cardHand);
        clientPlayerInGame.cardDeck = ClientCardDeck.fromMessage(message.cardDeck);
        return clientPlayerInGame;
    }
}
//# sourceMappingURL=ClientPlayerInGame.js.map