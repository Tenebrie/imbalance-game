import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentSlyzard extends ServerCard {
	private deployEffectStage: 'consume' | 'play' = 'consume'
	private cardsToChoose: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			tribes: [CardTribe.DRACONID],
			faction: CardFaction.MONSTER,
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Slyzard',
				description: '*Consume* a different Bronze unit from your graveyard, then play a copy of it from your deck.',
				flavor:
					'No man alive, no matter his brawn, no matter his skill, can parry a blow dealt by the tail of a slyzard, the pincers of a giant scorpion or the claws of a griffin.',
			},
		})

		// TODO: Test me, probably borken
		this.createDeployTargets(TargetType.CARD_IN_UNIT_GRAVEYARD)
			.targetCount(1)
			.totalTargetCount(2)
			.require(() => this.deployEffectStage === 'consume')
			.requireSamePlayer()
			.require(({ targetCard }) => targetCard.type === CardType.UNIT)
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE)
			.require(({ targetCard }) => !(targetCard instanceof GwentSlyzard))
			.perform(({ targetCard }) => {
				const owner = targetCard.ownerPlayer
				const targetPower = targetCard.stats.power
				owner.cardGraveyard.removeCard(targetCard)
				this.buffs.addMultiple(BuffStrength, targetPower, this)

				const validCards = owner.cardDeck.allCards.filter((card) => card.type === targetCard.type)
				if (validCards.length === 0) {
					return
				}
				this.cardsToChoose = validCards
				this.deployEffectStage = 'play'
			})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.targetCount(1)
			.totalTargetCount(2)
			.require(() => this.deployEffectStage === 'play')
			.require(({ targetCard }) => this.cardsToChoose.includes(targetCard))
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeck(targetCard)
				this.deployEffectStage = 'consume'
			})
	}
}
