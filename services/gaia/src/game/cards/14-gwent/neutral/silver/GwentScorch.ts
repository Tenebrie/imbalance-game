import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getAllHighestUnits } from '@src/utils/Utils'

export default class GwentScorch extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			tribes: [CardTribe.SPELL],
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Scorch',
				description: 'Destroy all the *Highest* units.',
				flavor: "Geralt took one step back. He'd seen men hit by Scorch before. Or more accurately, seen what remained of them afterwards.",
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const targets = getAllHighestUnits(game.board.getAllSplashableUnits())
			targets.forEach((target) => {
				game.animation.thread(() => {
					Keywords.destroyUnit({
						unit: target,
						source: this,
					})
				})
			})
		})
	}
}
