import TestGameTemplates from '../../../../utils/TestGameTemplates'
import BuffGrowth from '../../../buffs/BuffGrowth'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerUnit from '../../../models/ServerUnit'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitEldergroveTender from './UnitEldergroveTender'

describe('UnitEldergroveTender', () => {
	let game: ServerGame
	let cardInHand: ServerCard
	let player: ServerPlayerInGame
	let allyTarget: ServerUnit

	beforeEach(() => {
		;({ game, cardInHand, player } = TestGameTemplates.singleCardTest(UnitEldergroveTender))
		allyTarget = game.board.createUnit(new TestingUnitNoEffect(game), player, 0, 0)!
	})

	it('gives target extra power immediately', () => {
		game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		game.events.resolveEvents()
		game.cardPlay.selectCardTarget(player, game.cardPlay.getResolvingCardTargets()[0].target)
		expect(allyTarget.card.stats.power).toEqual(allyTarget.card.stats.basePower + UnitEldergroveTender.BONUS_POWER(cardInHand))
	})

	it('gives target Growth buff', () => {
		game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		game.events.resolveEvents()
		game.cardPlay.selectCardTarget(player, game.cardPlay.getResolvingCardTargets()[0].target)
		expect(allyTarget.card.buffs.has(BuffGrowth)).toBeTruthy()
	})

	it('can only target an allied unit', () => {
		game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		game.events.resolveEvents()
		expect(game.cardPlay.getResolvingCardTargets().length).toEqual(1)
	})
})
