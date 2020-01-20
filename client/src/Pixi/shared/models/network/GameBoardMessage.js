import GameBoardRowMessage from './GameBoardRowMessage';
export default class GameBoardMessage {
    constructor(board) {
        this.rows = board.rows.map(row => new GameBoardRowMessage(row));
    }
}
//# sourceMappingURL=GameBoardMessage.js.map