import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentEpidemic extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			tribes: [CardTribe.SPELL, CardTribe.ORGANIC],
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Epidemic',
				description: 'Destroy all the Lowest units.',
				flavor: 'Epidemics respect no persons, no borders. They do respect facemasks though.',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const sortedUnits = game.board.getAllSplashableUnits().sort((a, b) => a.card.stats.power - b.card.stats.power)
			if (sortedUnits.length === 0) {
				return
			}
			const lowestPower = sortedUnits[0].card.stats.power
			const lowestUnits = sortedUnits.filter((unit) => unit.card.stats.power === lowestPower)
			lowestUnits.forEach((unit) => {
				game.animation.thread(() => {
					Keywords.destroyUnit({
						unit,
						source: this,
					})
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
