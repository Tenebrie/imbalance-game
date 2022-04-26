import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

export default class GwentIhuarraquax extends ServerCard {
	public static readonly START_DAMAGE = 5
	public static readonly TRIGGER_DAMAGE = 7
	public static readonly TRIGGER_TARGETS = 3

	private canTrigger = true

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 7,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Ihuarraquax`,
				description: `Deal *${GwentIhuarraquax.START_DAMAGE}* damage to self.<p>The next time this unit's current power equals its base power, deal *${GwentIhuarraquax.TRIGGER_DAMAGE}* damage to *${GwentIhuarraquax.TRIGGER_TARGETS}* random enemies on turn end.`,
				flavor: `Inconceivable. Impossible, Ciri thought, returning to her senses. Unicorns don't exist, not any more, not in this world. Unicorns are extinct.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			this.canTrigger = true
			triggeringUnit.dealDamage(DamageInstance.fromCard(GwentIhuarraquax.START_DAMAGE, this))
		})

		const doDamage = () => {
			this.canTrigger = false
			const validTargets = game.board.getSplashableUnitsForOpponentOf(this)
			const targets = getMultipleRandomArrayValues(validTargets, GwentIhuarraquax.TRIGGER_TARGETS)
			targets.forEach((unit) => {
				unit.dealDamage(DamageInstance.fromCard(GwentIhuarraquax.TRIGGER_DAMAGE, this), 'stagger')
			})
		}

		this.createEffect(GameEventType.CARD_MULTIBUFF_CREATED)
			.require(() => this.canTrigger)
			.require(() => this.stats.power === this.stats.basePower)
			.perform(() => doDamage())

		this.createEffect(GameEventType.CARD_TAKES_DAMAGE)
			.require(() => this.canTrigger)
			.require(() => this.stats.power === this.stats.basePower)
			.perform(() => doDamage())
	}
}
