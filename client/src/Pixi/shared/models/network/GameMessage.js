export default class GameMessage {
    constructor(game, owner, playerCount) {
        this.id = game.id;
        this.name = game.name;
        this.owner = owner.username;
        this.playerCount = playerCount;
    }
}
//# sourceMappingURL=GameMessage.js.map