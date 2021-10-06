import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffVoidBrandTribe from '@src/game/buffs/01-arcane/BuffVoidBrandTribe'
import BuffStrength from '@src/game/buffs/BuffStrength'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

// TODO: Fix adding the tribes is not reflected on frontend
export default class UnitVoidBrand extends ServerCard {
	public static readonly EXTRA_POWER = 1
	extraPower = UnitVoidBrand.EXTRA_POWER

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.MANIFESTATION],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 14,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			extraPower: UnitVoidBrand.EXTRA_POWER,
		}
		this.addRelatedCards().requireTribe(CardTribe.VOIDSPAWN)

		this.createLocalization({
			en: {
				name: 'Void Brand',
				description: '*Deploy:*<br>Add *Voidspawn* tribe to an allied unit.<p>Your *Voidspawn* have +{extraPower} Power.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.require(({ targetUnit }) => !targetUnit.card.tribes.includes(CardTribe.VOIDSPAWN))
			.perform(({ targetUnit }) => {
				targetUnit.buffs.add(BuffVoidBrandTribe, this)
			})

		this.createSelector()
			.require(() => this.location === CardLocation.BOARD)
			.requireTarget(({ target }) => target.tribes.includes(CardTribe.VOIDSPAWN))
			.requireTarget(({ target }) => target.ownerGroup === this.ownerGroup)
			.provide(BuffStrength, this.extraPower)
	}
}
