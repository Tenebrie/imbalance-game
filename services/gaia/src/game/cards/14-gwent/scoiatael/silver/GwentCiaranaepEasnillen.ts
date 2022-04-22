import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentCiaranaepEasnillen extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 9,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Ciaran aep Easnillen`,
				description: `Toggle a unit's *Lock* status and move it to this row on its side.`,
				flavor: `The path to freedom is paved in blood, not ink.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.perform(({ targetCard, targetUnit }) => {
				Keywords.toggleLock({
					card: targetCard,
					source: this,
				})

				const unit = this.unit
				if (!unit) {
					return
				}

				let targetRow = unit.boardRow

				if (targetUnit.boardRow.index === targetRow.index) {
					return
				}

				if (!targetUnit.owner.owns(this)) {
					targetRow = game.board.getOppositeRow(targetRow)
				}

				if (targetRow.isFull()) {
					return
				}

				Keywords.moveUnit(targetUnit, targetRow, targetRow.farRightUnitIndex)
			})
	}
}
