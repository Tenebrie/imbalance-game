import Core from '@/Pixi/Core';
import ClientCardDeck from '@/Pixi/models/ClientCardDeck';
import RenderedCardHand from '@/Pixi/models/RenderedCardHand';
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame';
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard';
const handlers = {
    'gameState/start': (data) => {
        Core.board.setInverted(data.isBoardInverted);
    },
    'gameState/chat': (data) => {
    },
    'gameState/hand': (data) => {
        Core.player.cardHand = RenderedCardHand.fromMessage(data);
    },
    'gameState/deck': (data) => {
        Core.player.cardDeck = ClientCardDeck.fromMessage(data);
    },
    'gameState/player/self': (data) => {
        Core.player.cardHand = RenderedCardHand.fromMessage(data.cardHand);
        Core.player.cardDeck = ClientCardDeck.fromMessage(data.cardDeck);
        Core.player.morale = data.morale;
        Core.player.timeUnits = data.timeUnits;
    },
    'gameState/player/opponent': (data) => {
        Core.registerOpponent(ClientPlayerInGame.fromMessage(data));
    },
    'gameState/board': (data) => {
        data.rows.forEach(row => {
            Core.board.rows[row.index].setOwner(Core.getPlayer(row.ownerId));
        });
    },
    'gameState/units': (data) => {
        Core.board.clearBoard();
        data.forEach(message => {
            const card = RenderedCardOnBoard.fromMessage(message);
            Core.board.insertUnit(card, message.rowIndex, message.unitIndex);
        });
    },
    // TODO: Fix orders
    // 'gameState/board/orders': (data: UnitOrderMessage[]) => {
    // 	const newAttackMessages = data.filter(message => !Core.board.queuedAttacks.find(attack => attack.attacker.card.id === message.attackerId && attack.target.card.id === message.targetId))
    // 	const removedAttacks = Core.board.queuedAttacks.filter(attack => !data.find(message => attack.attacker.card.id === message.attackerId && attack.target.card.id === message.targetId))
    // 	const newAttacks = newAttackMessages.map(message => RenderedAttackOrder.fromMessage(message))
    // 	Core.board.updateUnitOrders(newAttacks, removedAttacks)
    // },
    'update/game/phase': (data) => {
        Core.game.setTurnPhase(data);
    },
    'update/game/time': (data) => {
        Core.game.currentTime = data.currentTime;
        Core.game.maximumTime = data.maximumTime;
    },
    'update/board/unitCreated': (data) => {
        const card = RenderedCardOnBoard.fromMessage(data);
        Core.board.insertUnit(card, data.rowIndex, data.unitIndex);
    },
    'update/board/unitMoved': (data) => {
        const unit = Core.board.findUnitById(data.card.id);
        if (!unit) {
            return;
        }
        console.log(`${data.card.id} has moved from ${unit.rowIndex} to ${data.rowIndex}`);
        Core.board.removeUnit(unit);
        Core.board.insertUnit(unit, data.rowIndex, data.unitIndex);
    },
    'update/board/unitDestroyed': (data) => {
        const unit = Core.board.findUnitById(data.id);
        if (!unit) {
            return;
        }
        Core.board.destroyUnit(unit);
    },
    'update/board/row/owner': (data) => {
        Core.board.rows[data.index].setOwner(Core.getPlayer(data.ownerId));
    },
    'update/board/card/power': (data) => {
        const cardOnBoard = Core.board.findUnitById(data.id);
        if (!cardOnBoard) {
            return;
        }
        cardOnBoard.setPower(data.power);
    },
    'update/board/card/attack': (data) => {
        const cardOnBoard = Core.board.findUnitById(data.id);
        if (!cardOnBoard) {
            return;
        }
        cardOnBoard.setAttack(data.attack);
    },
    'update/player/self/morale': (data) => {
        Core.player.morale = data.morale;
    },
    'update/player/opponent/morale': (data) => {
        Core.opponent.morale = data.morale;
    },
    'update/player/self/timeUnits': (data) => {
        Core.player.timeUnits = data.timeUnits;
    },
    'update/player/opponent/timeUnits': (data) => {
        Core.opponent.timeUnits = data.timeUnits;
    },
    'update/player/self/hand/cardDrawn': (data) => {
        console.info('Cards drawn', data);
        data.forEach(cardMessage => {
            const card = Core.player.cardDeck.drawCardById(cardMessage.id);
            if (card) {
                Core.player.cardHand.addCard(card);
            }
        });
    },
    'update/player/opponent/hand/cardDrawn': (data) => {
        data.forEach(cardMessage => {
            const card = Core.opponent.cardDeck.drawCardById(cardMessage.id);
            if (card) {
                Core.opponent.cardHand.addCard(card);
            }
        });
    },
    'update/player/opponent/hand/cardRevealed': (data) => {
        const card = Core.opponent.cardHand.getCardById(data.id);
        if (card) {
            card.reveal(data.cardType, data.cardClass);
        }
    },
    'update/player/self/hand/cardDestroyed': (data) => {
        Core.player.cardHand.removeCardById(data.id);
    },
    'update/player/opponent/hand/cardDestroyed': (data) => {
        Core.opponent.cardHand.removeCardById(data.id);
    }
};
export default handlers;
//# sourceMappingURL=IncomingMessageHandlers.js.map