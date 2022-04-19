import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import ServerUnit from '@src/game/models/ServerUnit'

export default class GwentNecromancy extends ServerCard {
	private unitToBoost: ServerUnit | null = null
	private cardToBanish: ServerCard | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SPELL],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Necromancy',
				description: '*Banish* a Bronze or Silver unit from either graveyard, then boost an ally by its power.',
				flavor: 'We have ways of making you talk… alive or dead.',
			},
		})

		const finalizeAbility = () => {
			if (!this.unitToBoost || !this.cardToBanish) {
				return
			}
			const boostValue = this.cardToBanish.stats.basePower
			this.unitToBoost.boost(boostValue, this)
			this.cardToBanish.ownerPlayer.cardGraveyard.removeCard(this.cardToBanish)
		}

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			this.unitToBoost = null
			this.cardToBanish = null
		})

		this.createDeployTargets(TargetType.UNIT)
			.totalTargetCount(2)
			.requireAllied()
			.perform(({ targetUnit }) => {
				this.unitToBoost = targetUnit
				finalizeAbility()
			})
			.label('Boost this unit')

		this.createDeployTargets(TargetType.CARD_IN_UNIT_GRAVEYARD)
			.totalTargetCount(2)
			.require(({ targetCard }) => targetCard.type === CardType.UNIT)
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE || targetCard.color === CardColor.SILVER)
			.perform(({ targetCard }) => {
				this.cardToBanish = targetCard
				finalizeAbility()
			})
			.label('Banish this card')
	}
}
