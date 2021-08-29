import TestGameTemplates from '../../../../utils/TestGameTemplates'
import ServerBoardRow from '../../../models/ServerBoardRow'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitQuietInfiltrator from './UnitQuietInfiltrator'

describe('UnitQuietInfiltrator', () => {
	let game: ServerGame
	let cardInHand: ServerCard
	let player: ServerPlayerInGame
	let enemyRow: ServerBoardRow

	beforeEach(() => {
		;({ game, cardInHand, player } = TestGameTemplates.singleCardTest(UnitQuietInfiltrator))
		enemyRow = game.board.rows.find((row) => row.owner === player.opponentInGame)!
	})

	it("can be played on the opponent's board", () => {
		game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), enemyRow.index, 0)
		expect(game.board.getAllUnits().length).toEqual(1)
		expect(enemyRow.cards[0].card.class).toEqual('unitQuietInfiltrator')
	})

	it('deals damage to enemies', () => {
		const enemyRow = game.board.rows.find((row) => row.owner === player.opponentInGame)!
		game.board.createUnit(new TestingUnitNoEffect(game), game.players[0].players[0], enemyRow.index, 0)
		game.board.createUnit(new TestingUnitNoEffect(game), game.players[0].players[0], enemyRow.index, 1)
		game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), enemyRow.index, 1)
		game.events.resolveEvents()
		expect(enemyRow.cards[0].card.stats.power).toEqual(10)
		expect(enemyRow.cards[2].card.stats.power).toEqual(10)
	})
})
