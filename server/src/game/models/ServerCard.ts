import Card from '@shared/models/Card'
import CardType from '@shared/enums/CardType'
import ServerGame from './ServerGame'
import ServerUnit from './ServerUnit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerDamageInstance from './ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import ServerBuffContainer from './buffs/ServerBuffContainer'
import ServerRichTextVariables from './ServerRichTextVariables'
import RichTextVariables from '@shared/models/RichTextVariables'
import CardLibrary, { CardConstructor } from '../libraries/CardLibrary'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameHookType, {
	CardDestroyedHookArgs,
	CardDestroyedHookValues,
	CardTakesDamageHookArgs,
	CardTakesDamageHookValues,
	UnitDestroyedHookArgs,
	UnitDestroyedHookValues,
} from './events/GameHookType'
import GameEventType from '@shared/enums/GameEventType'
import GameEventCreators, {
	CardBuffCreatedEventArgs,
	CardBuffRemovedEventArgs,
	CardDestroyedEventArgs,
	CardDrawnEventArgs,
	CardPlayedEventArgs,
	CardPreResolvedEventArgs,
	CardResolvedEventArgs,
	CardReturnedEventArgs,
	CardTakesDamageEventArgs,
	CardTargetsConfirmedEventArgs,
	CardTargetSelectedCardEventArgs,
	CardTargetSelectedRowEventArgs,
	CardTargetSelectedUnitEventArgs,
	GameStartedEventArgs,
	RoundEndedEventArgs,
	RoundStartedEventArgs,
	RowBuffCreatedEventArgs,
	RowBuffRemovedEventArgs,
	SpellDeployedEventArgs,
	TurnEndedEventArgs,
	TurnStartedEventArgs,
	UnitCreatedEventArgs,
	UnitDeployedEventArgs,
	UnitDestroyedEventArgs,
	UnitMovedEventArgs,
	UnitOrderedCardEventArgs,
	UnitOrderedRowEventArgs,
	UnitOrderedUnitEventArgs,
} from './events/GameEventCreators'
import BotCardEvaluation from '../AI/BotCardEvaluation'
import Utils, { createRandomId, getClassFromConstructor } from '../../utils/Utils'
import ServerAnimation from './ServerAnimation'
import RelatedCardsDefinition from './RelatedCardsDefinition'
import ServerCardStats from './ServerCardStats'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { ServerCardTargeting } from './ServerCardTargeting'
import TargetType from '@shared/enums/TargetType'
import { EventSubscription } from './events/EventSubscription'
import { EventHook } from './events/EventHook'
import { CardSelectorBuilder } from './events/selectors/CardSelectorBuilder'
import PlayTargetDefinitionBuilder from '@src/game/models/targetDefinitions/PlayTargetDefinitionBuilder'
import DeployTargetDefinitionBuilder from '@src/game/models/targetDefinitions/DeployTargetDefinitionBuilder'
import {
	CardTargetValidatorArguments,
	PositionTargetValidatorArguments,
	RowTargetValidatorArguments,
	UnitTargetValidatorArguments,
} from '@src/types/TargetValidatorArguments'
import OrderTargetDefinitionBuilder from '@src/game/models/targetDefinitions/OrderTargetDefinitionBuilder'

interface ServerCardBaseProps {
	faction: CardFaction
	tribes?: CardTribe | CardTribe[]
	features?: CardFeature | CardFeature[]
	relatedCards?: CardConstructor | CardConstructor[]
	sortPriority?: number
	expansionSet: ExpansionSet
	isExperimental?: boolean
	generatedArtworkMagicString?: string
	deckAddedCards?: CardConstructor[]
	hiddenFromLibrary?: boolean
}

interface LeaderStatsCardProps {
	directUnitDamage?: number
	splashUnitDamage?: number
	directSpellDamage?: number
	splashSpellDamage?: number
	directHealingPotency?: number
	splashHealingPotency?: number
	directBuffPotency?: number
	splashBuffPotency?: number
	directEffectDuration?: number
	splashEffectDuration?: number
	directTargetCount?: number
	criticalDamageChance?: number
	criticalBuffChance?: number
	criticalHealChance?: number
}

interface ServerCardLeaderProps extends ServerCardBaseProps {
	color: CardColor.LEADER
	stats?: LeaderStatsCardProps
}

interface ServerCardUnitProps extends ServerCardBaseProps {
	type: CardType.UNIT
	color: CardColor.GOLDEN | CardColor.SILVER | CardColor.BRONZE
	stats: {
		power: number
		armor?: number
	} & LeaderStatsCardProps
}

interface ServerCardSpellProps extends ServerCardBaseProps {
	type: CardType.SPELL
	color: CardColor.GOLDEN | CardColor.SILVER | CardColor.BRONZE | CardColor.TOKEN
	stats: {
		cost: number
	}
}

export type ServerCardProps = ServerCardLeaderProps | ServerCardUnitProps | ServerCardSpellProps

export default class ServerCard implements Card {
	public readonly id: string
	public readonly game: ServerGame
	public readonly targeting: ServerCardTargeting

	public readonly type: CardType
	public readonly class: string
	public readonly color: CardColor
	public readonly faction: CardFaction

	public readonly name: string
	public readonly title: string
	public readonly flavor: string
	public readonly listName: string
	public readonly description: string

	public readonly stats: ServerCardStats
	public readonly buffs: ServerBuffContainer = new ServerBuffContainer(this)
	public readonly baseTribes: CardTribe[]
	public readonly baseFeatures: CardFeature[]
	public readonly sortPriority: number
	public readonly expansionSet: ExpansionSet

	public readonly isCollectible: boolean
	public readonly isExperimental: boolean

	public dynamicTextVariables: ServerRichTextVariables = {}
	public botEvaluation: BotCardEvaluation = new BotCardEvaluation(this)
	public readonly generatedArtworkMagicString: string

	public readonly baseRelatedCards: CardConstructor[] = []
	public readonly customRelatedCards: RelatedCardsDefinition[] = []

	public isRevealed = false
	public isDead = false

	public readonly deckAddedCards: CardConstructor[] = []

	constructor(game: ServerGame, props: ServerCardProps) {
		const cardClass = getClassFromConstructor(this.constructor as CardConstructor)

		this.id = createRandomId('card', cardClass)
		this.game = game
		this.targeting = new ServerCardTargeting(this)
		this.class = cardClass

		this.type = props.color === CardColor.LEADER ? CardType.UNIT : props.type
		this.color = props.color
		this.faction = props.faction

		this.stats = new ServerCardStats(this, {
			power: props.color !== CardColor.LEADER && props.type === CardType.UNIT ? props.stats.power || 0 : 0,
			armor: props.color !== CardColor.LEADER && props.type === CardType.UNIT ? props.stats.armor || 0 : 0,
			spellCost: props.color !== CardColor.LEADER && props.type === CardType.SPELL ? props.stats.cost || 0 : 0,

			directUnitDamage: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.directUnitDamage || 0 : 0,
			splashUnitDamage: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.splashUnitDamage || 0 : 0,
			directSpellDamage: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.directSpellDamage || 0 : 0,
			splashSpellDamage: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.splashSpellDamage || 0 : 0,
			directHealingPotency: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.directHealingPotency || 0 : 0,
			splashHealingPotency: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.splashHealingPotency || 0 : 0,
			directBuffPotency: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.directBuffPotency || 0 : 0,
			splashBuffPotency: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.splashBuffPotency || 0 : 0,
			directEffectDuration: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.directEffectDuration || 0 : 0,
			splashEffectDuration: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.splashEffectDuration || 0 : 0,
			directTargetCount: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.directTargetCount || 0 : 0,
			criticalDamageChance: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.criticalDamageChance || 0 : 0,
			criticalBuffChance: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.criticalBuffChance || 0 : 0,
			criticalHealChance: props.color === CardColor.LEADER || props.type === CardType.UNIT ? props.stats?.criticalHealChance || 0 : 0,
		})

		this.name = `card.${this.class}.name`
		this.title = `card.${this.class}.title`
		this.flavor = `card.${this.class}.flavor`
		this.listName = `card.${this.class}.listName`
		this.description = `card.${this.class}.description`

		if (props.tribes === undefined) {
			this.baseTribes = []
		} else if (typeof props.tribes === 'object') {
			this.baseTribes = props.tribes
		} else {
			this.baseTribes = [props.tribes]
		}

		if (props.features === undefined) {
			this.baseFeatures = []
		} else if (typeof props.features === 'object') {
			this.baseFeatures = props.features
		} else {
			this.baseFeatures = [props.features]
		}

		if (props.relatedCards === undefined) {
			this.baseRelatedCards = []
		} else if (typeof props.relatedCards === 'object') {
			this.baseRelatedCards = props.relatedCards
		} else {
			this.baseRelatedCards = [props.relatedCards]
		}
		this.sortPriority = props.sortPriority !== undefined ? props.sortPriority : 99
		this.expansionSet = props.expansionSet

		this.isCollectible = props.hiddenFromLibrary
			? false
			: props.color === CardColor.LEADER || (props.color !== CardColor.TOKEN && props.type === CardType.UNIT)
		this.isExperimental = props.isExperimental !== undefined ? props.isExperimental : false

		this.generatedArtworkMagicString = props.generatedArtworkMagicString ? props.generatedArtworkMagicString : ''

		this.deckAddedCards = props.deckAddedCards || []

		if (!this.game) {
			return
		}

		const validLocations = [CardLocation.BOARD, CardLocation.HAND, CardLocation.GRAVEYARD, CardLocation.DECK]
		this.createCallback(GameEventType.CARD_TAKES_DAMAGE, validLocations)
			.forceIgnoreControlEffects()
			.require(({ triggeringCard }) => triggeringCard === this)
			.require(({ triggeringCard }) => triggeringCard.stats.power <= 0)
			.require(
				({ triggeringCard, powerDamageInstance }) =>
					(powerDamageInstance && powerDamageInstance.value > 0) || triggeringCard.stats.armor === 0
			)
			.perform(() => this.destroy())

		game.index.addCard(this)
	}

	public get tribes(): CardTribe[] {
		let tribes = this.baseTribes.slice()
		this.buffs.buffs.forEach((buff) => {
			tribes = tribes.concat(buff.cardTribes.slice())
		})
		return tribes
	}

	public get features(): CardFeature[] {
		let features = this.baseFeatures.slice()
		this.buffs.buffs.forEach((buff) => {
			features = features.concat(buff.cardFeatures.slice())
		})
		return features
	}

	public get variables(): RichTextVariables {
		const evaluatedVariables: RichTextVariables = {}
		Object.keys(this.dynamicTextVariables).forEach((key) => {
			const value = this.dynamicTextVariables[key]
			if (typeof value === 'function') {
				evaluatedVariables[key] = value(this)
			} else {
				evaluatedVariables[key] = value
			}
		})
		return evaluatedVariables
	}

	public get unit(): ServerUnit | null {
		return this.game.board.findUnitById(this.id) || null
	}

	public get owner(): ServerPlayerInGame | null {
		const thisCardInGame = this.game.findOwnedCardById(this.id)
		if (!thisCardInGame) {
			return null
		}
		return thisCardInGame.owner
	}

	public get ownerInGame(): ServerPlayerInGame {
		const owner = this.owner
		if (!owner) {
			throw new Error('Card has no owner while in the game!')
		}
		return owner
	}

	public get location(): CardLocation {
		const owner = this.owner
		if (!owner) {
			return CardLocation.UNKNOWN
		}

		if (owner.leader === this) {
			return CardLocation.LEADER
		}
		const cardInDeck = owner.cardDeck.findCardById(this.id)
		if (cardInDeck) {
			return CardLocation.DECK
		}
		const cardInHand = owner.cardHand.findCardById(this.id)
		if (cardInHand) {
			return CardLocation.HAND
		}
		const cardInStack = this.game.cardPlay.cardResolveStack.findCardById(this.id)
		if (cardInStack) {
			return CardLocation.STACK
		}
		const cardOnBoard = this.game.board.findUnitById(this.id)
		if (cardOnBoard) {
			return CardLocation.BOARD
		}
		const cardInGraveyard = owner.cardGraveyard.findCardById(this.id)
		if (cardInGraveyard) {
			return CardLocation.GRAVEYARD
		}
		return CardLocation.UNKNOWN
	}

	public get isVisuallyRendered(): boolean {
		return (
			this.location === CardLocation.BOARD ||
			this.location === CardLocation.HAND ||
			this.location === CardLocation.LEADER ||
			this.location === CardLocation.STACK
		)
	}

	public get relatedCards(): string[] {
		const customRelatedCards = Utils.sortCards(
			this.customRelatedCards
				.map((relatedCardsDefinition) =>
					CardLibrary.cards.filter((card) => relatedCardsDefinition.conditions.every((condition) => condition(card)))
				)
				.flat()
		).map((obj) => obj.class)

		return this.baseRelatedCards
			.map((obj) => getClassFromConstructor(obj))
			.concat(this.deckAddedCards.map((obj) => getClassFromConstructor(obj)))
			.concat(customRelatedCards)
	}

	public get deckPosition(): number {
		const owner = this.owner
		if (!owner) {
			return -1
		}
		return owner.cardDeck.getCardIndex(this)
	}

	public dealDamage(damageInstance: ServerDamageInstance): void {
		if (damageInstance.proxyCard) {
			this.game.animation.play(ServerAnimation.cardAttacksCards(damageInstance.proxyCard, [this]))
		} else if (damageInstance.sourceCard) {
			this.game.animation.play(ServerAnimation.cardAttacksCards(damageInstance.sourceCard, [this]))
		} else if (damageInstance.sourceRow) {
			this.game.animation.play(ServerAnimation.rowAttacksCards(damageInstance.sourceRow, [this]))
		} else {
			this.game.animation.play(ServerAnimation.universeAttacksCards([this]))
		}

		const hookValues = this.game.events.applyHooks<CardTakesDamageHookArgs, CardTakesDamageHookValues>(GameHookType.CARD_TAKES_DAMAGE, {
			targetCard: this,
			damageInstance: damageInstance,
		})

		if (hookValues.targetCard !== this) {
			hookValues.targetCard.dealDamage(ServerDamageInstance.redirectedFrom(hookValues.damageInstance, this))
			return
		}

		damageInstance = hookValues.damageInstance
		let damageToDeal = damageInstance.value

		let armorDamageInstance: ServerDamageInstance | null = null
		if (this.stats.armor > 0) {
			armorDamageInstance = damageInstance.clone()
			armorDamageInstance.value = Math.min(this.stats.armor, damageToDeal)
			damageToDeal -= armorDamageInstance.value
		}

		let powerDamageInstance: ServerDamageInstance | null = null
		if (damageToDeal > 0) {
			powerDamageInstance = damageInstance.clone()
			powerDamageInstance.value = Math.min(this.stats.power, damageToDeal)
		}

		if (armorDamageInstance) {
			this.stats.armor = this.stats.armor - armorDamageInstance.value
		}

		if (powerDamageInstance) {
			this.stats.power = this.stats.power - powerDamageInstance.value
		}

		this.game.events.postEvent(
			GameEventCreators.cardTakesDamage({
				game: this.game,
				triggeringCard: this,
				damageInstance: damageInstance,
				armorDamageInstance: armorDamageInstance,
				powerDamageInstance: powerDamageInstance,
			})
		)
	}

	heal(healingInstance: ServerDamageInstance): void {
		if (healingInstance.value <= 0) {
			return
		}

		if (healingInstance.sourceCard) {
			this.game.animation.play(ServerAnimation.cardHealsCards(healingInstance.sourceCard, [this]))
		} else {
			this.game.animation.play(ServerAnimation.universeHealsCards([this]))
		}
		this.stats.power = Math.min(this.stats.maxPower, this.stats.power + healingInstance.value)
	}

	restoreArmor(restorationInstance: ServerDamageInstance): void {
		if (restorationInstance.value <= 0) {
			return
		}

		if (restorationInstance.sourceCard) {
			this.game.animation.play(ServerAnimation.cardHealsCards(restorationInstance.sourceCard, [this]))
		} else {
			this.game.animation.play(ServerAnimation.universeHealsCards([this]))
		}
		this.stats.armor = Math.min(this.stats.maxArmor, this.stats.armor + restorationInstance.value)
	}

	/* Cleanse this card
	 * -------------------------
	 * Remove all active buffs from this card
	 */
	public cleanse(): void {
		this.buffs.removeAllDispellable()
	}

	/* Destroy this card / unit
	 * -------------------------
	 * If this card has associated unit on the board, the unit is destroyed instead and this method has no effect.
	 * Otherwise, the card is completely removed from the game (exiled).
	 */
	public destroy(): void {
		const unit = this.unit
		if (unit) {
			this.game.board.destroyUnit(unit)
			return
		}

		if (this.isDead) {
			return
		}

		this.isDead = true

		const hookValues = this.game.events.applyHooks<CardDestroyedHookValues, CardDestroyedHookArgs>(
			GameHookType.CARD_DESTROYED,
			{
				destructionPrevented: false,
			},
			{
				targetCard: this,
			}
		)

		if (hookValues.destructionPrevented) {
			this.stats.power = 0
			this.isDead = false
			return
		}

		const owner = this.owner
		if (!owner) {
			return
		}

		this.game.events.postEvent(
			GameEventCreators.cardDestroyed({
				game: this.game,
				triggeringCard: this,
				formerOwner: owner,
			})
		)

		const location = this.location
		if (location === CardLocation.HAND) {
			owner.cardHand.removeCard(this)
		} else if (location === CardLocation.DECK) {
			owner.cardDeck.removeCard(this)
		} else if (location === CardLocation.GRAVEYARD) {
			owner.cardGraveyard.removeCard(this)
		}

		this.game.events.unsubscribe(this)
		this.game.index.removeCard(this)
	}

	public reveal(): void {
		if (this.isRevealed) {
			return
		}

		const owner = this.owner
		if (!owner) {
			return
		}
		const opponent = owner.opponent
		if (!opponent) {
			return
		}

		this.isRevealed = true
		OutgoingMessageHandlers.notifyAboutOpponentCardRevealed(opponent.player, this)
	}

	/* Create card play targets
	 * ------------------------
	 * Add a target definition specifying the available card play targets.
	 * Adding first target definition will override the default behaviour (units can be played to any allied row, spells can be played to any row).
	 *
	 * Multiple target definitions will be added as inclusive OR.
	 */
	protected createPlayTargets(): PlayTargetDefinitionBuilder {
		const builder = PlayTargetDefinitionBuilder.base(this.game)
		this.targeting.playTargetDefinitions.push(builder)
		return builder
	}

	/* Create unit order targets
	 * -------------------------
	 * Add a target definition specifying the available unit order targets.
	 *
	 * Multiple target definitions will be added as inclusive OR.
	 */
	protected createOrderTargets(targetType: TargetType.UNIT): OrderTargetDefinitionBuilder<UnitTargetValidatorArguments>
	protected createOrderTargets(targetType: TargetType.BOARD_ROW): OrderTargetDefinitionBuilder<RowTargetValidatorArguments>
	protected createOrderTargets(targetType: TargetType.BOARD_POSITION): OrderTargetDefinitionBuilder<PositionTargetValidatorArguments>
	protected createOrderTargets(targetType: TargetType): OrderTargetDefinitionBuilder<any> {
		const builder = OrderTargetDefinitionBuilder.base(this, targetType)
		this.targeting.orderTargetDefinitions.push(builder)
		return builder
	}

	/* Require deploy effect targets
	 * -----------------------------
	 * Add a target definition specifying the required deploy effect targets.
	 */
	protected createDeployTargets(targetType: TargetType.UNIT): DeployTargetDefinitionBuilder<UnitTargetValidatorArguments>
	protected createDeployTargets(targetType: TargetType.BOARD_ROW): DeployTargetDefinitionBuilder<RowTargetValidatorArguments>
	protected createDeployTargets(targetType: TargetType.BOARD_POSITION): DeployTargetDefinitionBuilder<PositionTargetValidatorArguments>
	protected createDeployTargets(targetType: TargetType.CARD_IN_LIBRARY): DeployTargetDefinitionBuilder<CardTargetValidatorArguments>
	protected createDeployTargets(targetType: TargetType.CARD_IN_UNIT_HAND): DeployTargetDefinitionBuilder<CardTargetValidatorArguments>
	protected createDeployTargets(targetType: TargetType.CARD_IN_SPELL_HAND): DeployTargetDefinitionBuilder<CardTargetValidatorArguments>
	protected createDeployTargets(targetType: TargetType.CARD_IN_UNIT_DECK): DeployTargetDefinitionBuilder<CardTargetValidatorArguments>
	protected createDeployTargets(targetType: TargetType.CARD_IN_SPELL_DECK): DeployTargetDefinitionBuilder<CardTargetValidatorArguments>
	protected createDeployTargets(targetType: TargetType.CARD_IN_UNIT_GRAVEYARD): DeployTargetDefinitionBuilder<CardTargetValidatorArguments>
	protected createDeployTargets(targetType: TargetType.CARD_IN_SPELL_GRAVEYARD): DeployTargetDefinitionBuilder<CardTargetValidatorArguments>
	protected createDeployTargets(targetType: TargetType): DeployTargetDefinitionBuilder<any> {
		const builder = DeployTargetDefinitionBuilder.base(this, targetType)
		this.targeting.deployTargetDefinitions.push(builder)
		return builder
	}

	/* Subscribe to a game event
	 * -------------------------
	 * Create a callback for a global game event. By default, this callback will trigger regardless
	 * of which card has triggered the event or where the subscriber is located.
	 *
	 * Subscribers must **NOT** modify the event that triggered the callback. See `createHook` for
	 * event modifications.
	 *
	 * The callback will only trigger if the subscriber is located in one of the locations specified by `location` argument.
	 */
	protected createCallback(event: GameEventType.GAME_STARTED, location: CardLocation[] | 'any'): EventSubscription<GameStartedEventArgs>
	protected createCallback(event: GameEventType.TURN_STARTED, location: CardLocation[] | 'any'): EventSubscription<TurnStartedEventArgs>
	protected createCallback(event: GameEventType.TURN_ENDED, location: CardLocation[] | 'any'): EventSubscription<TurnEndedEventArgs>
	protected createCallback(event: GameEventType.ROUND_STARTED, location: CardLocation[] | 'any'): EventSubscription<RoundStartedEventArgs>
	protected createCallback(event: GameEventType.ROUND_ENDED, location: CardLocation[] | 'any'): EventSubscription<RoundEndedEventArgs>
	protected createCallback(event: GameEventType.UNIT_MOVED, location: CardLocation[] | 'any'): EventSubscription<UnitMovedEventArgs>
	protected createCallback(
		event: GameEventType.CARD_TAKES_DAMAGE,
		location: CardLocation[] | 'any'
	): EventSubscription<CardTakesDamageEventArgs>
	protected createCallback(
		event: GameEventType.CARD_TARGET_SELECTED_CARD,
		location: CardLocation[] | 'any'
	): EventSubscription<CardTargetSelectedCardEventArgs>
	protected createCallback(
		event: GameEventType.CARD_TARGET_SELECTED_UNIT,
		location: CardLocation[] | 'any'
	): EventSubscription<CardTargetSelectedUnitEventArgs>
	protected createCallback(
		event: GameEventType.CARD_TARGET_SELECTED_ROW,
		location: CardLocation[] | 'any'
	): EventSubscription<CardTargetSelectedRowEventArgs>
	protected createCallback(
		event: GameEventType.UNIT_ORDERED_CARD,
		location: CardLocation[] | 'any'
	): EventSubscription<UnitOrderedCardEventArgs>
	protected createCallback(
		event: GameEventType.UNIT_ORDERED_ROW,
		location: CardLocation[] | 'any'
	): EventSubscription<UnitOrderedRowEventArgs>
	protected createCallback(event: GameEventType.UNIT_CREATED, location: CardLocation[] | 'any'): EventSubscription<UnitCreatedEventArgs>
	protected createCallback(event: GameEventType.CARD_DESTROYED, location: CardLocation[] | 'any'): EventSubscription<CardDestroyedEventArgs>
	protected createCallback(event: GameEventType.UNIT_DESTROYED, location: CardLocation[] | 'any'): EventSubscription<UnitDestroyedEventArgs>
	protected createCallback(event: GameEventType.CARD_PLAYED, location: CardLocation[] | 'any'): EventSubscription<CardPlayedEventArgs>
	protected createCallback(
		event: GameEventType.CARD_BUFF_CREATED,
		location: CardLocation[] | 'any'
	): EventSubscription<CardBuffCreatedEventArgs>
	protected createCallback(
		event: GameEventType.CARD_BUFF_REMOVED,
		location: CardLocation[] | 'any'
	): EventSubscription<CardBuffRemovedEventArgs>
	protected createCallback(
		event: GameEventType.ROW_BUFF_CREATED,
		location: CardLocation[] | 'any'
	): EventSubscription<RowBuffCreatedEventArgs>
	protected createCallback(
		event: GameEventType.ROW_BUFF_REMOVED,
		location: CardLocation[] | 'any'
	): EventSubscription<RowBuffRemovedEventArgs>
	protected createCallback<ArgsType>(event: GameEventType, location: CardLocation[] | 'any'): EventSubscription<ArgsType> {
		const callback = this.game.events.createCallback<ArgsType>(this, event)
		if (location !== 'any') {
			callback.require(() => location.includes(this.location))
		}
		return callback
	}

	/* Subscribe to a game event triggered by this buff
	 * ------------------------------------------------
	 * `createEffect` is equivalent to `createCallback`, but it will only trigger when
	 * the `effectSource` is set to the subscriber.
	 */
	protected createEffect(event: GameEventType.CARD_DRAWN): EventSubscription<CardDrawnEventArgs>
	protected createEffect(event: GameEventType.CARD_RETURNED): EventSubscription<CardReturnedEventArgs>
	protected createEffect(event: GameEventType.UNIT_DEPLOYED): EventSubscription<UnitDeployedEventArgs>
	protected createEffect(event: GameEventType.SPELL_DEPLOYED): EventSubscription<SpellDeployedEventArgs>
	/**
	 * @deprecated
	 * Use `createDeployTargets(...).perform` instead
	 */
	protected createEffect(event: GameEventType.CARD_TARGET_SELECTED_CARD): EventSubscription<CardTargetSelectedCardEventArgs>
	/**
	 * @deprecated
	 * Use `createDeployTargets(...).perform` instead
	 */
	protected createEffect(event: GameEventType.CARD_TARGET_SELECTED_UNIT): EventSubscription<CardTargetSelectedUnitEventArgs>
	/**
	 * @deprecated
	 * Use `createDeployTargets(...).perform` instead
	 */
	protected createEffect(event: GameEventType.CARD_TARGET_SELECTED_ROW): EventSubscription<CardTargetSelectedRowEventArgs>
	/**
	 * @deprecated
	 * Use `createDeployTargets(...).finalize` instead
	 */
	protected createEffect(event: GameEventType.CARD_TARGETS_CONFIRMED): EventSubscription<CardTargetsConfirmedEventArgs>
	protected createEffect(event: GameEventType.CARD_PRE_RESOLVED): EventSubscription<CardPreResolvedEventArgs>
	protected createEffect(event: GameEventType.CARD_RESOLVED): EventSubscription<CardResolvedEventArgs>
	protected createEffect(event: GameEventType.UNIT_ORDERED_CARD): EventSubscription<UnitOrderedCardEventArgs>
	protected createEffect(event: GameEventType.UNIT_ORDERED_UNIT): EventSubscription<UnitOrderedUnitEventArgs>
	protected createEffect(event: GameEventType.UNIT_ORDERED_ROW): EventSubscription<UnitOrderedRowEventArgs>
	protected createEffect(event: GameEventType.UNIT_DESTROYED): EventSubscription<UnitDestroyedEventArgs>
	protected createEffect<ArgsType>(event: GameEventType): EventSubscription<ArgsType> {
		return this.game.events
			.createCallback<ArgsType>(this, event)
			.require((args, rawEvent) => !!rawEvent.effectSource && rawEvent.effectSource === this)
	}

	/* Subscribe to a game hook
	 * ------------------------
	 * Game hooks are callbacks that allow the event to be modified. For example, using the
	 * `GameHookType.CARD_TAKES_DAMAGE` hook it is possible to increase or decrease the damage a card
	 * takes from any source.
	 *
	 * The hook will only trigger if the subscriber is located in one of the locations specified by `location` argument.
	 */
	protected createHook(
		hookType: GameHookType.CARD_TAKES_DAMAGE,
		location: CardLocation[]
	): EventHook<CardTakesDamageHookValues, CardTakesDamageHookArgs>
	protected createHook(
		hookType: GameHookType.CARD_DESTROYED,
		location: CardLocation[]
	): EventHook<CardDestroyedHookValues, CardDestroyedHookArgs>
	protected createHook(
		hookType: GameHookType.UNIT_DESTROYED,
		location: CardLocation[]
	): EventHook<UnitDestroyedHookValues, UnitDestroyedHookArgs>
	protected createHook<HookValues, HookArgs>(hookType: GameHookType, location: CardLocation[]): EventHook<HookValues, HookArgs> {
		return this.game.events.createHook<HookValues, HookArgs>(this, hookType).requireLocations(location)
	}

	/* Create an aura effect
	 * ------------------------
	 * The selector is evaluated for every card in the game.
	 */
	protected createSelector(): CardSelectorBuilder {
		return this.game.events.createSelector(this)
	}

	/* Create an aura effect for this card only
	 * ----------------------------------------
	 * The selector will be evaluated for this card only. Otherwise works exactly as `createSelector`.
	 */
	protected createSelfSelector(): CardSelectorBuilder {
		return this.game.events.createSelector(this).requireTarget(({ target }) => target === this)
	}

	protected addRelatedCards(): RelatedCardsDefinition {
		const relatedCardDefinition = new RelatedCardsDefinition()
		this.customRelatedCards.push(relatedCardDefinition)
		return relatedCardDefinition
	}
}
