import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { asSplashBuffPotency } from '@src/utils/LeaderStats'

import BuffStrength from '../../../buffs/BuffStrength'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitHighClassPerformer extends ServerCard {
	bonusPower = asSplashBuffPotency(2)
	cardsRequired = 7

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.NOBLE],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
			cardsRequired: this.cardsRequired,
		}

		this.createPlayTargets().require(({ targetRow }) => targetRow.cards.length >= this.cardsRequired)

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const otherAlliedRows = this.game.board.rows
			.filter((row) => row.owner === this.ownerPlayerNullable)
			.filter((row) => row.index !== this.unit!.rowIndex)

		const alliedUnitsOnTargetRows = otherAlliedRows.map((row) => row.cards).flat()

		alliedUnitsOnTargetRows.forEach((unit) => {
			unit.buffs.addMultiple(BuffStrength, this.bonusPower, this)
		})
	}
}
