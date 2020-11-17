import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import BuffSpellDiscount from '../../../buffs/BuffSpellDiscount'
import CardLibrary from '../../../libraries/CardLibrary'
import BuffDuration from '@shared/enums/BuffDuration'

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
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE],
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.addRelatedCards().requireTribe(CardTribe.SCROLL)

		this.createDeployEffectTargets()
			.totalTargets(2)
			.target(TargetType.UNIT)
			.require(TargetType.UNIT, () => !this.sacrificedUnit)
			.requireAlliedUnit()
			.requireNotSelf()

		this.createDeployEffectTargets()
			.totalTargets(2)
			.target(TargetType.CARD_IN_LIBRARY)
			.require(TargetType.CARD_IN_LIBRARY, () => !!this.sacrificedUnit)
			.require(TargetType.CARD_IN_LIBRARY, args => args.targetCard.tribes.includes(CardTribe.SCROLL))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT)
			.require(() => !this.sacrificedUnit)
			.perform(({ targetUnit }) => this.onSacrificeTargetSelected(targetUnit))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD)
			.require(() => !!this.sacrificedUnit)
			.perform(({ targetCard }) => this.onScrollSelected(targetCard))

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED)
			.perform(() => this.onTargetsConfirmed())
	}

	private onScrollSelected(target: ServerCard): void {
		const newCard = CardLibrary.instantiateByInstance(this.game, target)
		this.ownerInGame.cardHand.addSpell(newCard)
		newCard.buffs.addMultiple(BuffSpellDiscount, this.sacrificedUnit!.power, this, BuffDuration.INFINITY)
	}

	private onSacrificeTargetSelected(target: ServerUnit): void {
		this.sacrificedUnit = {
			power: target.card.stats.power
		}
		this.game.board.destroyUnit(target, this)
	}

	private onTargetsConfirmed(): void {
		this.sacrificedUnit = null
	}
}
