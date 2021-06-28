import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffProtector from '@src/game/buffs/BuffProtector'
import { asRecurringBuffPotency } from '@src/utils/LeaderStats'

/* Original design and implementation by Nenl */
export default class UnitHelplessPeasants extends ServerCard {
	selfBuff = asRecurringBuffPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.PEASANT],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_PROTECTOR],
			stats: {
				power: 7,
				armor: 0,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.dynamicTextVariables = {
			selfBuff: this.selfBuff,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			const secondWeakling = new UnitHelplessPeasants(this.game)
			this.game.board.createUnit(secondWeakling, triggeringUnit.rowIndex, triggeringUnit.unitIndex + 1)
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ player }) => player === this.ownerInGame)
			.perform(() => this.onTurnEnded())
	}

	private onTurnEnded(): void {
		const thisUnit = this.unit!
		const unitDistance = this.game.board.getDistanceToStaticFront(thisUnit.rowIndex)
		const isProtected = this.game.board
			.getUnitsOwnedByPlayer(thisUnit.owner)
			.some(
				(anotherUnit) =>
					this.game.board.getDistanceToStaticFront(anotherUnit.rowIndex) < unitDistance &&
					this.game.board.getHorizontalUnitDistance(thisUnit, anotherUnit) < 1 &&
					anotherUnit.card.buffs.has(BuffProtector)
			)

		if (isProtected) {
			thisUnit.buffs.addMultiple(BuffStrength, this.selfBuff, this)
		}
	}
}
