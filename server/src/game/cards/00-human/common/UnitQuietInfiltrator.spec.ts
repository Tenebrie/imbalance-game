import ServerGame from '../../../models/ServerGame'
import ServerCard from '../../../models/ServerCard'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import TestGameTemplates from '../../../../utils/TestGameTemplates'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import UnitQuietInfiltrator from './UnitQuietInfiltrator'
import TestingUnitNoTargeting from '../../11-testing/TestingUnitNoTargeting'
import ServerBoardRow from '../../../models/ServerBoardRow'

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
		game.cardPlay.playCard(new ServerOwnedCard(cardInHand, player), enemyRow.index, 0)
		expect(game.board.getAllUnits().length).toEqual(1)
		expect(enemyRow.cards[0].card.class).toEqual('unitQuietInfiltrator')
	})

	it('deals damage to enemies', () => {
		const enemyRow = game.board.rows.find((row) => row.owner === player.opponentInGame)!
		game.board.createUnit(new TestingUnitNoTargeting(game), player.opponentInGame, enemyRow.index, 0)
		game.board.createUnit(new TestingUnitNoTargeting(game), player.opponentInGame, enemyRow.index, 1)
		game.cardPlay.playCard(new ServerOwnedCard(cardInHand, player), enemyRow.index, 1)
		game.events.resolveEvents()
		expect(enemyRow.cards[0].card.stats.power).toEqual(7)
		expect(enemyRow.cards[2].card.stats.power).toEqual(7)
	})
})
