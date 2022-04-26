import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentMuzzle extends ServerCard {
	public static readonly MAX_POWER = 8

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Muzzle`,
				description: `*Charm* a Bronze or Silver enemy with *${GwentMuzzle.MAX_POWER}* power or less.`,
				flavor: `Not every beast can be tamed. But all can be muzzled.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.require(({ targetUnit }) => targetUnit.card.isBronzeOrSilver)
			.require(({ targetUnit }) => targetUnit.stats.power <= GwentMuzzle.MAX_POWER)
			.perform(({ targetUnit, player }) => {
				const validRows = game.board.getControlledRows(player).filter((row) => row.isNotFull())
				const targetRow = getRandomArrayValue(validRows)
				if (!targetRow) {
					return
				}

				Keywords.charmUnit(targetUnit, targetRow, targetRow.farRightUnitIndex, player)
			})
	}
}
