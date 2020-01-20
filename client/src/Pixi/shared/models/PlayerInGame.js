import CardHand from './CardHand';
import CardDeck from './CardDeck';
export default class PlayerInGame {
    constructor(player) {
        this.player = player;
        this.morale = 0;
        this.timeUnits = 0;
        this.cardHand = new CardHand([]);
        this.cardDeck = new CardDeck([]);
    }
}
//# sourceMappingURL=PlayerInGame.js.map