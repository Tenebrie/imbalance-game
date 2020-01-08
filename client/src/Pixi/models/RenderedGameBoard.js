import Constants from '@/shared/Constants';
import GameBoard from '@/shared/models/GameBoard';
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow';
export default class RenderedGameBoard extends GameBoard {
    constructor() {
        super();
        this.rows = [];
        for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
            this.rows.push(new RenderedGameBoardRow());
        }
    }
    isHovered(mousePosition) {
        return this.rows.some(row => row.isHovered(mousePosition));
    }
}
//# sourceMappingURL=RenderedGameBoard.js.map