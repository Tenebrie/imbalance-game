import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentRowFrost from '@src/game/buffs/14-gwent/BuffGwentRowFrost'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import GwentBitingFrost from '../../neutral/bronze/GwentBitingFrost'

export default class GwentCaranthir extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.WILD_HUNT, CardTribe.MAGE, CardTribe.OFFICER],
			stats: {
				power: 9,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentBitingFrost],
		})

		this.createLocalization({
			en: {
				name: 'Caranthir Ar-Feiniel',
				description: 'Move an enemy to the row opposite this unit and apply *Biting Frost* to that row.',
				flavor: 'A favorite son who chose a life of villainy.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.require(() => !!this.unit)
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
				oppositeRow.buffs.add(BuffGwentRowFrost, this)
			})
	}
}
