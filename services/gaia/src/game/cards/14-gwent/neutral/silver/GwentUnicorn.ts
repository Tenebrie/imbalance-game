import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentUnicorn extends ServerCard {
	public static readonly BOOST = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.BEAST, CardTribe.DOOMED],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Unicorn',
				description: `Boost all other units by *${GwentUnicorn.BOOST}*.`,
				flavor: `They say unicorns are fond of virgins. Since finding a virgin these days is as hard as finding a unicorn, no one has been able to verify the theory.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const targets = game.board.getAllUnits().filter((unit) => unit.card !== this)
			targets.forEach((unit) => {
				unit.boost(GwentUnicorn.BOOST, this, 'stagger')
			})
		})
	}
}
