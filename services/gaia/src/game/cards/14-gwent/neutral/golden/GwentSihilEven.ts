import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentSihilEven extends ServerCard {
	public static readonly DAMAGE = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.DOOMED],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: `Sihil's isEven`,
				description: `Deal *${GwentSihilEven.DAMAGE}* damage to all enemies with even power.`,
				flavor: `What's written on this blade? That a curse? No. An insult.`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const validTargets = game.board.getSplashableUnitsForOpponentOf(this).filter((unit) => unit.stats.power % 2 === 0)
			validTargets.forEach((unit) => {
				unit.dealDamage(DamageInstance.fromCard(GwentSihilEven.DAMAGE, this), 'stagger')
			})
		})
	}
}
