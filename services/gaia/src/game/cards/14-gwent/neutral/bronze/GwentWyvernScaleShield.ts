import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import ServerUnit from '@src/game/models/ServerUnit'

export default class GwentWyvernScaleShield extends ServerCard {
	private unitToBoost: ServerUnit | null = null
	private cardToLookAt: ServerCard | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Wyvern Scale Shield',
				description: 'Boost a unit by the base power of a Bronze or Silver unit in your hand.',
				flavor: 'Stronger than your average shield and far more stylish.',
			},
		})

		const finalizeAbility = () => {
			if (!this.unitToBoost || !this.cardToLookAt) {
				return
			}
			const boostValue = this.cardToLookAt.stats.basePower
			this.unitToBoost.buffs.addMultiple(BuffStrength, boostValue, this)
		}

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			this.unitToBoost = null
			this.cardToLookAt = null
		})

		this.createDeployTargets(TargetType.UNIT)
			.totalTargetCount(2)
			.requireAllied()
			.perform(({ targetUnit }) => {
				this.unitToBoost = targetUnit
				finalizeAbility()
			})
			.label('Boost this unit')

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.totalTargetCount(2)
			.requireAllied()
			.require(({ targetCard }) => targetCard.type === CardType.UNIT)
			.perform(({ targetCard }) => {
				this.cardToLookAt = targetCard
				finalizeAbility()
			})
			.label("Use this card's base power")
	}
}
