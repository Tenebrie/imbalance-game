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

export default class UnitForestScout extends ServerCard {
	boardPowerBonus = 7
	moralePowerBonus = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.HUMAN],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			boardPowerBonus: this.boardPowerBonus,
			moralePowerBonus: this.moralePowerBonus
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const unit = this.unit
		const owner = unit.owner
		const ownPower = this.game.board.getTotalPlayerPower(owner)
		const opponentsPower = this.game.board.getTotalPlayerPower(owner.opponent)
		if (ownPower < opponentsPower) {
			this.buffs.addMultiple(BuffStrength, this.boardPowerBonus, this)
		}
		if (owner.morale < owner.opponent.morale) {
			this.buffs.addMultiple(BuffStrength, this.moralePowerBonus, this)
		}
	}
}
