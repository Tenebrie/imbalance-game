import BuffAlignment from '@shared/enums/BuffAlignment'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerAnimation from '@src/game/models/ServerAnimation'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentVriheddBrigade extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
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
				name: `Vrihedd Brigade`,
				description: `Clear *Hazard*s from its row and move a unit to this row on its side.`,
				flavor: `Vrihedd? What's that mean? Trouble.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			const targetRow = triggeringUnit.boardRow
			const hazards = targetRow.buffs.buffs.filter((buff) => buff.alignment === BuffAlignment.NEGATIVE)
			if (hazards.length === 0) {
				return
			}
			game.animation.play(ServerAnimation.cardAffectsRows(this, [targetRow]))
			hazards.forEach((hazard) =>
				targetRow.buffs.removeByReference(hazard, {
					source: this,
				})
			)
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.require(({ targetUnit }) => targetUnit.boardRow !== this.unit!.boardRow)
			.require(({ targetUnit }) => targetUnit.boardRow !== game.board.getOppositeRow(this.unit!.boardRow))
			.require(({ targetUnit }) => {
				let targetRow = this.unit!.boardRow

				if (!targetUnit.owner.owns(this)) {
					targetRow = game.board.getOppositeRow(targetRow)
				}

				return targetRow.isNotFull()
			})
			.perform(({ targetUnit }) => {
				let targetRow = this.unit!.boardRow

				if (!targetUnit.owner.owns(this)) {
					targetRow = game.board.getOppositeRow(targetRow)
				}

				Keywords.moveUnit(targetUnit, targetRow, targetRow.farRightUnitIndex)
			})
	}
}
