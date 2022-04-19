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

export default class GwentExpiredAle extends ServerCard {
	public static readonly DAMAGE = 6

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Expired Ale',
				description: `Deal *${GwentExpiredAle.DAMAGE}* damage to the *Highest* enemy on each row.`,
				flavor: 'That beer supposed to be green…?',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const enemyRows = game.board.getControlledRows(owner.opponent)
			const targets = enemyRows.map((row) => getHighestUnit(row.cards)).filter((unit) => !!unit)
			targets.forEach((unit) => {
				unit?.dealDamage(DamageInstance.fromCard(GwentExpiredAle.DAMAGE, this), 'stagger')
			})
			game.animation.syncAnimationThreads()
		})
	}
}
