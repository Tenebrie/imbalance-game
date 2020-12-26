import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import BuffStrength from '../../../buffs/BuffStrength'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectBuffPotency } from '../../../../utils/LeaderStats'

export default class UnitForestScout extends ServerCard {
	boardPowerBonus = asDirectBuffPotency(7)
	moralePowerBonus = asDirectBuffPotency(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.PEASANT],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			boardPowerBonus: this.boardPowerBonus,
			moralePowerBonus: this.moralePowerBonus,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const owner = this.ownerInGame
		const ownPower = this.game.board.getTotalPlayerPower(owner)
		const opponentsPower = this.game.board.getTotalPlayerPower(owner.opponentInGame)
		if (ownPower < opponentsPower) {
			this.buffs.addMultiple(BuffStrength, this.boardPowerBonus, this)
		}
		if (owner.morale < owner.opponentInGame.morale) {
			this.buffs.addMultiple(BuffStrength, this.moralePowerBonus, this)
		}
	}
}
