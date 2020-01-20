export default class GameBoardRowMessage {
    constructor(row) {
        this.index = row.index;
        this.ownerId = row.owner ? row.owner.player.id : '';
    }
}
//# sourceMappingURL=GameBoardRowMessage.js.map