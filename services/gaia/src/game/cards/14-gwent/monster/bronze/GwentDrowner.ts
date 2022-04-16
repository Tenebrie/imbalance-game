import BuffAlignment from '@shared/enums/BuffAlignment'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentDrowner extends ServerCard {
	public static readonly DAMAGE = 2
	public static readonly HAZARD_DAMAGE = 4

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
					'Move an enemy to the row opposite this unit and deal {damage} damage to it.\nIf that row is under a *Hazard*, deal {hazardDamage} damage instead.',
				flavor:
					'Though the witchman lusts for gold, for the smiting of a drowner thou shalt give him but a silver penny, or three halfpence, at most.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.require(() => {
				const oppositeRow = game.board.getOppositeRow(this.unit!.rowIndex)
				return !oppositeRow.isFull()
			})
			.require(({ targetUnit }) => {
				const oppositeRow = game.board.getOppositeRow(this.unit!.rowIndex)
				return targetUnit.rowIndex !== oppositeRow.index
			})
			.perform(({ targetUnit }) => {
				const oppositeRow = game.board.getOppositeRow(this.unit!.rowIndex)
				game.board.moveUnit(targetUnit, oppositeRow.index, oppositeRow.farRightUnitIndex)

				const hasHazard = oppositeRow.buffs.buffs.some((buff) => buff.alignment === BuffAlignment.NEGATIVE)
				const damage = hasHazard ? GwentDrowner.HAZARD_DAMAGE : GwentDrowner.DAMAGE
				targetUnit.dealDamage(DamageInstance.fromCard(damage, this))
			})
	}
}
