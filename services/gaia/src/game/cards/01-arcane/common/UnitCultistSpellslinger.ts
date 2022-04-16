import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import BuffSpellDiscount from '../../../buffs/BuffSpellDiscount'
import CardLibrary from '../../../libraries/CardLibrary'
import ServerUnit from '../../../models/ServerUnit'

interface SacrificedUnit {
	power: number
}

export default class UnitCultistSpellslinger extends ServerCard {
	sacrificedUnit: SacrificedUnit | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			tribes: CardTribe.CULTIST,
			faction: CardFaction.ARCANE,
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.addRelatedCards().requireTribe(CardTribe.SCROLL)

		this.createDeployTargets(TargetType.UNIT)
			.require(() => !this.sacrificedUnit)
			.requireAllied()
			.requireNotSelf()

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(() => !!this.sacrificedUnit)
			.require((args) => args.targetCard.tribes.includes(CardTribe.SCROLL))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT)
			.require(() => !this.sacrificedUnit)
			.perform(({ targetUnit }) => this.onSacrificeTargetSelected(targetUnit))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD)
			.require(() => !!this.sacrificedUnit)
			.perform(({ targetCard }) => this.onScrollSelected(targetCard))

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED).perform(() => this.onTargetsConfirmed())
	}

	private onScrollSelected(target: ServerCard): void {
		const newCard = CardLibrary.instantiateFromInstance(this.game, target)
		this.ownerPlayer.cardHand.addSpell(newCard)
		newCard.buffs.addMultiple(BuffSpellDiscount, this.sacrificedUnit!.power, this, BuffDuration.INFINITY)
	}

	private onSacrificeTargetSelected(target: ServerUnit): void {
		this.sacrificedUnit = {
			power: target.card.stats.power,
		}
		this.game.board.destroyUnit(target, {
			destroyer: this,
		})
	}

	private onTargetsConfirmed(): void {
		this.sacrificedUnit = null
	}
}
