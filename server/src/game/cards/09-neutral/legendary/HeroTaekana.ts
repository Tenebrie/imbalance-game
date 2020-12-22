import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffStrength from '../../../buffs/BuffStrength'
import {asSplashBuffPotency} from '../../../../utils/LeaderStats'

export default class HeroTaekana extends ServerCard {
	strengthGiven = asSplashBuffPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			strengthGiven: this.strengthGiven
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const units = this.game.board
			.getAllUnits()
			.filter(unit => unit.buffs.buffs.length === 0)
		units.forEach(unit => {
			this.game.animation.createAnimationThread()
			unit.buffs.addMultiple(BuffStrength, this.strengthGiven, this)
			this.game.animation.commitAnimationThread()
		})
	}
}
