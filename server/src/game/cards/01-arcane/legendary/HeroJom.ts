import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import Keywords from '../../../../utils/Keywords'
import CardLibrary from '../../../libraries/CardLibrary'
import ServerAnimation from '../../../models/ServerAnimation'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import UnitAbyssPortal from '../tokens/UnitAbyssPortal'
import UnitVoidPortal from '../tokens/UnitVoidPortal'

export default class HeroJom extends ServerCard {
	portalsNeeded = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY],
			relatedCards: [UnitVoidPortal],
			stats: {
				power: 14,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			portalsNeeded: this.portalsNeeded,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.require(() => this.ownerControlsEnoughPortals())
			.perform(() => this.onTurnEnded())
	}

	private onDeploy(): void {
		Keywords.createCard.forOwnerOf(this).fromConstructor(UnitVoidPortal)
	}

	private ownerControlsEnoughPortals(): boolean {
		const portalsControlled = this.game.board
			.getUnitsOwnedByGroup(this.ownerGroupNullable)
			.filter((unit) => unit.card instanceof UnitVoidPortal)
		return portalsControlled.length >= this.portalsNeeded
	}

	private onTurnEnded(): void {
		const portalsControlled = this.game.board
			.getUnitsOwnedByGroup(this.ownerGroupNullable)
			.filter((unit) => unit.card instanceof UnitVoidPortal)

		portalsControlled.forEach((portal) => {
			this.game.animation.createAnimationThread()
			this.game.animation.play(ServerAnimation.cardAffectsCards(this, [portal.card]))
			portal.card.destroy()
			this.game.animation.commitAnimationThread()
		})

		const abyssPortal = CardLibrary.instantiate(this.game, UnitAbyssPortal) as UnitAbyssPortal
		const unit = this.unit!
		this.game.board.createUnit(abyssPortal, unit.originalOwner, unit.rowIndex, unit.unitIndex + 1)
		abyssPortal.onTurnEnded()
	}
}
