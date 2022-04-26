import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BotCardEvaluation from '@src/game/AI/BotCardEvaluation'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMahakamVolunteers extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.DWARF],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Mahakam Volunteers',
				description: '*Summon* all copies of this unit.',
				flavor:
					"Hoooahhh! Hoooaahhh! Hooo! Prepare yer hineys, clowns! Soon we'll be comin' 'round! Tae kick 'em till ye've feet for frowns!",
			},
		})

		this.createPlayTargets().evaluate(({ targetRow }) => (targetRow.hasBoon ? 1 : 0))

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner, triggeringUnit }) => {
			const validCards = owner.cardDeck.allCards.filter((card) => card instanceof GwentMahakamVolunteers)
			if (validCards.length === 0) {
				return
			}
			validCards.forEach((card, index) => {
				game.animation.thread(() => {
					Keywords.summonUnitFromDeck({ card, owner, rowIndex: triggeringUnit.rowIndex, unitIndex: triggeringUnit.unitIndex + index + 1 })
				})
			})

			game.animation.syncAnimationThreads()
		})

		this.botEvaluation = new CustomBotEvaluation(this)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		const location = this.card.location
		return location === CardLocation.HAND ? 95 : this.card.stats.power
	}
}
