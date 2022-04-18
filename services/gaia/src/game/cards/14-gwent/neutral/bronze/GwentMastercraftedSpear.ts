import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import ServerUnit from '@src/game/models/ServerUnit'

export default class GwentMastercraftedSpear extends ServerCard {
	private unitToDamage: ServerUnit | null = null
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
				name: 'Mastercrafted Spear',
				description: 'Deal damage equal to the base power of a Bronze or Silver unit in your hand.',
				flavor: 'Hold that spear up, weakling! Not a single horse shall pass!',
			},
		})

		const finalizeAbility = () => {
			if (!this.unitToDamage || !this.cardToLookAt) {
				return
			}
			const damageValue = this.cardToLookAt.stats.basePower
			this.unitToDamage.dealDamage(DamageInstance.fromCard(damageValue, this))
		}

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			this.unitToDamage = null
			this.cardToLookAt = null
		})

		this.createDeployTargets(TargetType.UNIT)
			.totalTargetCount(2)
			.requireAllied()
			.perform(({ targetUnit }) => {
				this.unitToDamage = targetUnit
				finalizeAbility()
			})
			.label('Deal damage to this unit')

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
