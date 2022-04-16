import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { mapUnitsToCards } from '@src/utils/Utils'

import ServerAnimation from '../../../models/ServerAnimation'

export default class HeroPozoga extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const sortedUnits = this.game.board.getAllUnits().sort((a, b) => b.card.stats.power - a.card.stats.power)
		const maximumPower = sortedUnits[0].card.stats.power
		const targetUnits = sortedUnits.filter((unit) => unit.card.stats.power === maximumPower)

		this.game.animation.play(ServerAnimation.cardAttacksCards(this, mapUnitsToCards(targetUnits)))
		targetUnits.forEach((unit) => {
			this.game.board.destroyUnit(unit)
		})
	}
}
