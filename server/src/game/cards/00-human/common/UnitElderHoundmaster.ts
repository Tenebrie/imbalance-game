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
import CardLibrary from '../../../libraries/CardLibrary'
import UnitTrainedHound from '../tokens/UnitTrainedHound'

export default class UnitElderHoundmaster extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.HUMAN],
			features: [CardFeature.KEYWORD_DEPLOY],
			relatedCards: [UnitTrainedHound],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const unit = this.unit!
		const owner = unit.owner
		const makeHound = () => CardLibrary.instantiateByConstructor(this.game, UnitTrainedHound)
		const hounds = [makeHound(), makeHound()]
		this.game.animation.createInstantAnimationThread()
		this.game.board.createUnit(hounds[0], owner, unit.rowIndex, unit.unitIndex)
		this.game.board.createUnit(hounds[1], owner, unit.rowIndex, unit.unitIndex + 1)
		this.game.animation.commitAnimationThread()
	}
}
