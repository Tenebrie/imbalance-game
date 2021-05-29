import ServerGame from '../../../models/ServerGame'
import TestGameTemplates from '../../../../utils/TestGameTemplates'
import ServerCard from '../../../models/ServerCard'
import UnitEndlessArmy from './UnitEndlessArmy'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'

describe('UnitEndlessArmy', () => {
	let game: ServerGame
	let cardInHand: ServerCard
	let player: ServerPlayerInGame

	beforeEach(() => {
		;({ game, cardInHand, player } = TestGameTemplates.singleCardTest(UnitEndlessArmy))
	})

	it("adds another endless army to the owner's deck", () => {
		expect(player.cardDeck.unitCards.length).toEqual(0)
		game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		game.events.resolveEvents()
		expect(player.cardDeck.unitCards.length).toEqual(1)
		expect(player.cardDeck.unitCards[0].class).toEqual(cardInHand.class)
	})
})
