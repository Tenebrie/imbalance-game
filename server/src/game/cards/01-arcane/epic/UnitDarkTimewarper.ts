import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ServerBoardRow from '../../../models/ServerBoardRow'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffBurning from '../../../buffs/BuffBurning'
import GameEventCreators, {CardTargetSelectedEventArgs, UnitDeployedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import UnitVoidPortal from '../tokens/UnitVoidPortal'
import ServerAnimation from '../../../models/ServerAnimation'

export default class UnitDarkTimewarper extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY],
			relatedCards: [UnitVoidPortal],
			stats: {
				power: 6
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createEffect<UnitDeployedEventArgs>(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const targets = this.game.board.getAllUnits().map(unit => unit.card).filter(card => card instanceof UnitVoidPortal) as UnitVoidPortal[]

		targets.forEach(target => {
			this.game.animation.createAnimationThread()
			this.game.animation.play(ServerAnimation.cardAffectsCards(this, [target]))
			target.onTurnEnded()
			this.game.animation.commitAnimationThread()
		})

		this.owner.createCardFromLibraryByPrototype(UnitVoidPortal)
	}
}
