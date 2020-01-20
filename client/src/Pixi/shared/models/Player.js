export default class Player {
    constructor(id, username) {
        this.id = id;
        this.username = username;
    }
    static fromPlayerMessage(playerMessage) {
        return new Player(playerMessage.id, playerMessage.username);
    }
}
//# sourceMappingURL=Player.js.map