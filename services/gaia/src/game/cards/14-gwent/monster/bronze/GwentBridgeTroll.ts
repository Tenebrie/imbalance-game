import BuffAlignment from '@shared/enums/BuffAlignment'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getConstructorFromBuff } from '@src/utils/Utils'

export default class GwentBridgeTroll extends ServerCard {
	private selectedRow: ServerBoardRow | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.OGROID],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Bridge Troll',
				description: 'Move a *Hazard* on an enemy row to a different enemy row.',
				flavor:
					"This here bridge? Trolls built it a long time ago. Sat under it, made folk pay 'em a hefty copper to pass. Thing is, not many folk pass this way. So they all packed up, went their way. Not the bridge, though. It stayed.",
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.totalTargetCount(2)
			.require(() => this.selectedRow === null)
			.requireEnemy()
			.require(({ targetRow }) => targetRow.buffs.buffs.some((buff) => buff.alignment === BuffAlignment.NEGATIVE))
			.perform(({ targetRow }) => (this.selectedRow = targetRow))

		this.createDeployTargets(TargetType.BOARD_ROW)
			.totalTargetCount(2)
			.require(() => this.selectedRow !== null)
			.requireEnemy()
			.require(({ targetRow }) => targetRow !== this.selectedRow)
			.perform(({ targetRow }) => {
				const buffToMove = this.selectedRow!.buffs.buffs.find((buff) => buff.alignment === BuffAlignment.NEGATIVE)
				if (!this.selectedRow || !buffToMove) {
					return
				}
				this.selectedRow.buffs.removeAll(getConstructorFromBuff(buffToMove), this)
				targetRow.buffs.add(getConstructorFromBuff(buffToMove), this)
			})

		this.createEffect(GameEventType.CARD_RESOLVED).perform(() => (this.selectedRow = null))
	}
}
