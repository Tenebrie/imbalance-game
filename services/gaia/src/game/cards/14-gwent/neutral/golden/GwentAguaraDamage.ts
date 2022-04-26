import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import { getHighestUnit } from '@src/utils/Utils'

export default class GwentAguaraDamage extends ServerCard {
	public static readonly DAMAGE = 5

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
				name: `Aguara's Scolding`,
				description: `Deal *${GwentAguaraDamage.DAMAGE}* damage to the *Highest* enemy.`,
				flavor: `Smarten up right now, or it's off to an aguara with you!`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const validUnits = game.board.getSplashableUnitsForOpponentOf(this)
			const target = getHighestUnit(validUnits)
			if (!target) {
				return
			}
			target.dealDamage(DamageInstance.fromCard(GwentAguaraDamage.DAMAGE, this))
		})
	}
}
