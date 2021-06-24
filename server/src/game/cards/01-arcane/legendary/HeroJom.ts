import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import UnitVoidPortal from '../tokens/UnitVoidPortal'
import ServerAnimation from '../../../models/ServerAnimation'
import UnitAbyssPortal from '../tokens/UnitAbyssPortal'
import CardLibrary from '../../../libraries/CardLibrary'
import Keywords from '../../../../utils/Keywords'

export default class HeroJom extends ServerCard {
	portalsNeeded = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY],
			relatedCards: [UnitVoidPortal, UnitAbyssPortal],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			portalsNeeded: this.portalsNeeded,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ player }) => player === this.owner)
			.require(() => this.ownerControlsEnoughPortals())
			.perform(() => this.onTurnEnded())
	}

	private onDeploy(): void {
		Keywords.createCard.forOwnerOf(this).fromConstructor(UnitVoidPortal)
	}

	private ownerControlsEnoughPortals(): boolean {
		const portalsControlled = this.game.board.getUnitsOwnedByPlayer(this.owner).filter((unit) => unit.card instanceof UnitVoidPortal)
		return portalsControlled.length >= this.portalsNeeded
	}

	private onTurnEnded(): void {
		const portalsControlled = this.game.board.getUnitsOwnedByPlayer(this.owner).filter((unit) => unit.card instanceof UnitVoidPortal)

		portalsControlled.forEach((portal) => {
			this.game.animation.createAnimationThread()
			this.game.animation.play(ServerAnimation.cardAffectsCards(this, [portal.card]))
			portal.card.destroy()
			this.game.animation.commitAnimationThread()
		})

		const abyssPortal = CardLibrary.instantiate(this.game, UnitAbyssPortal) as UnitAbyssPortal
		const unit = this.unit!
		this.game.board.createUnit(abyssPortal, unit.rowIndex, unit.unitIndex + 1)
		abyssPortal.onTurnEnded()
	}
}
