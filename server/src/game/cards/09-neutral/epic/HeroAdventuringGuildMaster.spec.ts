import ServerGame from '../../../models/ServerGame'
import TestGameTemplates from '../../../../utils/TestGameTemplates'
import ServerCard from '../../../models/ServerCard'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import HeroAdventuringGuildMaster from './HeroAdventuringGuildMaster'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'

describe('HeroAdventuringGuildMaster', () => {
	let game: ServerGame
	let cardInHand: ServerCard
	let player: ServerPlayerInGame
	let baseCardPower: number

	beforeEach(() => {
		;({ game, cardInHand, player } = TestGameTemplates.singleCardTest(HeroAdventuringGuildMaster))
		baseCardPower = cardInHand.stats.power
	})

	it('does not add any power if played alone', () => {
		const basePower = cardInHand.stats.power
		game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		game.events.resolveEvents()
		expect(game.board.rows[0].cards[0].card.stats.power).toEqual(basePower)
	})

	it('adds 10 power if played after two other cards on the same turn', () => {
		game.cardPlay.playedCards.push({
			card: new HeroAdventuringGuildMaster(game),
			player: player,
			turnIndex: game.turnIndex,
			roundIndex: game.roundIndex,
		})
		game.cardPlay.playedCards.push({
			card: new HeroAdventuringGuildMaster(game),
			player: player,
			turnIndex: game.turnIndex,
			roundIndex: game.roundIndex,
		})

		game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		game.events.resolveEvents()
		expect(game.board.rows[0].cards[0].card.stats.power).toEqual(baseCardPower + 10)
	})

	it('does not add any power if other cards are played on previous turn', () => {
		game.cardPlay.playedCards.push({
			card: new HeroAdventuringGuildMaster(game),
			player: player,
			turnIndex: game.turnIndex - 1,
			roundIndex: game.roundIndex,
		})
		game.cardPlay.playedCards.push({
			card: new HeroAdventuringGuildMaster(game),
			player: player,
			turnIndex: game.turnIndex - 1,
			roundIndex: game.roundIndex,
		})

		game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		game.events.resolveEvents()
		expect(game.board.rows[0].cards[0].card.stats.power).toEqual(baseCardPower)
	})

	it('does not add any power if other cards are played on previous round', () => {
		game.cardPlay.playedCards.push({
			card: new HeroAdventuringGuildMaster(game),
			player: player,
			turnIndex: game.turnIndex,
			roundIndex: game.roundIndex - 1,
		})
		game.cardPlay.playedCards.push({
			card: new HeroAdventuringGuildMaster(game),
			player: player,
			turnIndex: game.turnIndex,
			roundIndex: game.roundIndex - 1,
		})

		game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		game.events.resolveEvents()
		expect(game.board.rows[0].cards[0].card.stats.power).toEqual(baseCardPower)
	})
})
