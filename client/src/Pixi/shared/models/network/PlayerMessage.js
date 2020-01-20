export default class PlayerMessage {
    constructor(player) {
        this.id = player.id;
        this.username = player.username;
    }
    static fromPlayer(player) {
        return new PlayerMessage(player);
    }
}
//# sourceMappingURL=PlayerMessage.js.map