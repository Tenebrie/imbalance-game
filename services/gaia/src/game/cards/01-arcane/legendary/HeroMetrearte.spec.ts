import TargetType from '../../../../../../shared/src/enums/TargetType'
import TestGameTemplates from '../../../../utils/TestGameTemplates'
import { getClassFromConstructor } from '../../../../utils/Utils'
import CardLibrary from '../../../libraries/CardLibrary'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import TestingArcaneExperimentalLeaderPower from '../../11-testing/TestingArcaneExperimentalLeaderPower'
import TestingArcaneNormalLeaderPower from '../../11-testing/TestingArcaneNormalLeaderPower'
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
		CardLibrary.forceLoadCards([TestingArcaneNormalLeaderPower])
		const normalCardClass = getClassFromConstructor(TestingArcaneNormalLeaderPower)
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
		expect(player.cardHand.spellCards[0].class).toEqual(getClassFromConstructor(TestingArcaneNormalLeaderPower))
	})

	it('does not offer experimental cards', () => {
		CardLibrary.forceLoadCards([TestingArcaneNormalLeaderPower, TestingArcaneExperimentalLeaderPower])
		playerAction(() => {
			game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		})

		const normalCardClass = getClassFromConstructor(TestingArcaneNormalLeaderPower)
		const experimentalCardClass = getClassFromConstructor(TestingArcaneExperimentalLeaderPower)
		const validDeployTargets = game.cardPlay
			.getDeployTargets()
			.map((target) => target.target)
			.filter(
				(target) =>
					target.targetType === TargetType.CARD_IN_LIBRARY &&
					(target.targetCard.class === normalCardClass || target.targetCard.class === experimentalCardClass)
			)
		expect(validDeployTargets.length).toEqual(1)
		expect(validDeployTargets[0].targetType === TargetType.CARD_IN_LIBRARY && validDeployTargets[0].targetCard.class).toEqual(
			normalCardClass
		)
	})
})
