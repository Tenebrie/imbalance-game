import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'

import BuffStrength from '../../../buffs/BuffStrength'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitForestScout extends ServerCard {
	public static readonly BOARD_POWER_BONUS_BASE = 10
	public static readonly ROUND_POWER_BONUS_BASE = 10
	boardPowerBonus = asDirectBuffPotency(UnitForestScout.BOARD_POWER_BONUS_BASE)
	moralePowerBonus = asDirectBuffPotency(UnitForestScout.ROUND_POWER_BONUS_BASE)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.COMMONER],
			stats: {
				power: 11,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			boardPowerBonus: this.boardPowerBonus,
			moralePowerBonus: this.moralePowerBonus,
		}

		this.createLocalization({
			en: {
				name: 'Forest Scout',
				description:
					'*Deploy:*\n' +
					'If you are losing on the board, gain +{boardPowerBonus} Power\n' +
					'If your opponent won more rounds than you, gain +{moralePowerBonus} Power.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const owner = this.ownerPlayer
		const ownPower = this.game.board.getTotalPlayerPower(owner.group)
		const opponentsPower = this.game.board.getTotalPlayerPower(owner.opponent)
		if (ownPower < opponentsPower) {
			this.buffs.addMultiple(BuffStrength, this.boardPowerBonus, this)
		}
		if (owner.group.roundWins < owner.opponent.roundWins) {
			this.buffs.addMultiple(BuffStrength, this.moralePowerBonus, this)
		}
	}
}
