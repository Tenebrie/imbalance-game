import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ServerAnimation from '../../../models/ServerAnimation'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'

export default class HeroPozoga extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.NEUTRAL)
		this.basePower = 3
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY]

		this.createEffect(GameEventType.UNIT_DEPLOYED)
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
