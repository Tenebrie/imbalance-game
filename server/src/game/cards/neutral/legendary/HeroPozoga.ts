import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import GameEvent from '../../../models/GameEvent'
import ServerAnimation from '../../../models/ServerAnimation'

export default class HeroPozoga extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.NEUTRAL)
		this.basePower = 3

		this.createCallback(GameEvent.EFFECT_UNIT_DEPLOY)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const sortedUnits = this.game.board.getAllUnits().sort((a, b) => b.card.power - a.card.power)
		const maximumPower = sortedUnits[0].card.power
		const targetUnits = sortedUnits.filter(unit => unit.card.power === maximumPower)

		this.game.animation.play(ServerAnimation.universeAttacksUnits(targetUnits))
		targetUnits.forEach(unit => {
			unit.destroy()
		})
	}
}
