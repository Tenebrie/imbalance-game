import TargetType from '@shared/enums/TargetType'

import TestGameTemplates from '../../../../utils/TestGameTemplates'
import { getClassFromConstructor } from '../../../../utils/Utils'
import CardLibrary from '../../../libraries/CardLibrary'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import LeaderNighterie from '../leaders/Nighterie/LeaderNighterie'
import SpellShadowSpark from '../leaders/Nighterie/SpellShadowSpark'
import LeaderVelElleron from '../leaders/VelElleron/LeaderVelElleron'
import HeroMetrearte from './HeroMetrearte'

describe('HeroMetrearte', () => {
	let game: ServerGame
	let cardInHand: ServerCard
	let player: ServerPlayerInGame
	let playerAction: (callback: () => void) => void

	beforeEach(() => {
		;({ game, cardInHand, player, playerAction } = TestGameTemplates.singleCardTest(HeroMetrearte))
	})

	it('adds selected card to hand', () => {
		CardLibrary.forceLoadCards([LeaderVelElleron, LeaderNighterie, SpellShadowSpark])
		const normalCardClass = getClassFromConstructor(SpellShadowSpark)
		playerAction(() => {
			game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		})
		playerAction(() => {
			const validDeployTargets = game.cardPlay
				.getDeployTargets()
				.map((target) => target.target)
				.filter((target) => target.targetType === TargetType.CARD_IN_LIBRARY && target.targetCard.class === normalCardClass)
			game.cardPlay.selectCardTarget(player, validDeployTargets[0])
		})
		expect(player.cardHand.spellCards.length).toEqual(1)
		expect(player.cardHand.spellCards[0].class).toEqual(getClassFromConstructor(SpellShadowSpark))
	})
})
