import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentDudaAgitator extends ServerCard {
	public static readonly DAMAGE = 2
	public static readonly DISTANCE = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.BEAST, CardTribe.DOOMED],
			stats: {
				power: 1,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: `Duda: Agitator`,
				description: `Deal *${GwentDudaAgitator.DAMAGE}* damage to *${GwentDudaAgitator.DISTANCE}* units on each side of this unit.`,
				flavor: `Zoltan's parrot had the extraordinary ability to irritate anyone who spent time with it. Including Zoltan.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			const targets = triggeringUnit.boardRow.splashableCards
				.filter((unit) => unit !== triggeringUnit)
				.filter((unit) => game.board.getHorizontalUnitDistance(triggeringUnit, unit) <= GwentDudaAgitator.DISTANCE)

			targets.forEach((unit) => {
				unit.dealDamage(DamageInstance.fromCard(GwentDudaAgitator.DAMAGE, this), 'stagger')
			})
		})
	}
}
