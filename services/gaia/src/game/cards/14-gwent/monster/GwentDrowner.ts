import BuffAlignment from '@shared/enums/BuffAlignment'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerUnit from '@src/game/models/ServerUnit'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentDrowner extends ServerCard {
	public static readonly DAMAGE = 2
	public static readonly HAZARD_DAMAGE = 4

	private unitToMove: ServerUnit | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.VAMPIRE],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentDrowner.DAMAGE,
			hazardDamage: GwentDrowner.HAZARD_DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Drowner',
				description:
					'Move an enemy to the row opposite this unit and deal {damage} damage to it. If that row is under a *Hazard*, deal {hazardDamage} damage instead.',
				flavor:
					'Though the witchman lusts for gold, for the smiting of a drowner thou shalt give him but a silver penny, or three halfpence, at most.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.targetCount(1)
			.totalTargetCount(2)
			.requireEnemy()
			.require(() => this.unitToMove === null)
			.require(() => {
				const oppositeRow = game.board.getOppositeRow(this.unit!.rowIndex)
				return !oppositeRow.isFull()
			})
			.require(({ targetUnit }) => {
				const oppositeRow = game.board.getOppositeRow(this.unit!.rowIndex)
				return targetUnit.rowIndex !== oppositeRow.index
			})
			.perform(({ targetUnit }) => {
				this.unitToMove = targetUnit
			})

		this.createDeployTargets(TargetType.BOARD_POSITION)
			.targetCount(1)
			.totalTargetCount(2)
			.requireEnemy()
			.require(() => this.unitToMove !== null)
			.require(({ targetRow }) => {
				const oppositeRow = game.board.getOppositeRow(this.unit!.rowIndex)
				return targetRow === oppositeRow
			})
			.perform(({ targetRow, targetPosition }) => {
				const targetUnit = this.unitToMove!
				game.board.moveUnit(targetUnit, targetRow.index, targetPosition)

				const hasHazard = targetRow.buffs.buffs.some((buff) => buff.alignment === BuffAlignment.NEGATIVE)
				const damage = hasHazard ? GwentDrowner.HAZARD_DAMAGE : GwentDrowner.DAMAGE
				targetUnit.dealDamage(DamageInstance.fromCard(damage, this))
			})

		this.createEffect(GameEventType.CARD_RESOLVED).perform(() => {
			this.unitToMove = null
		})
	}
}
