import uuidv4 from 'uuid/v4'
import Card from '@shared/models/Card'
import CardType from '@shared/enums/CardType'
import ServerGame from './ServerGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerUnit from './ServerUnit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerDamageInstance from './ServerDamageSource'
import ServerBoardRow from './ServerBoardRow'
import ServerCardTarget from './ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import TargetValidatorArguments from '../../types/TargetValidatorArguments'
import TargetDefinition from './targetDefinitions/TargetDefinition'
import TargetDefinitionBuilder from './targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import ServerBuffContainer from './ServerBuffContainer'
import ServerRichTextVariables from './ServerRichTextVariables'
import RichTextVariables from '@shared/models/RichTextVariables'
import GameLibrary, {CardConstructor} from '../libraries/CardLibrary'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameHookType, {
	CardDestroyedHookArgs,
	CardDestroyedHookValues,
	CardTakesDamageHookArgs,
	CardTakesDamageHookValues
} from './GameHookType'
import {EventCallback, EventHook} from './ServerGameEvents'
import GameEventType from '@shared/enums/GameEventType'
import GameEventCreators, {CardTakesDamageEventArgs} from './GameEventCreators'
import BotCardEvaluation from '../AI/BotCardEvaluation'
import Utils from '../../utils/Utils'
import ServerAnimation from './ServerAnimation'

export default class ServerCard extends Card {
	game: ServerGame
	isRevealed = false
	buffs = new ServerBuffContainer(this)
	dynamicTextVariables: ServerRichTextVariables
	generatedArtworkMagicString = ''
	botEvaluation: BotCardEvaluation

	isBeingDestroyed = false

	constructor(game: ServerGame, cardType: CardType, unitSubtype: CardColor, faction: CardFaction) {
		super(uuidv4(), cardType, 'missingno')
		this.game = game
		this.color = unitSubtype
		this.faction = faction
		this.dynamicTextVariables = {}
		this.botEvaluation = new BotCardEvaluation(this)

		const validLocations = [CardLocation.BOARD, CardLocation.HAND, CardLocation.GRAVEYARD, CardLocation.DECK]
		this.createCallback<CardTakesDamageEventArgs>(GameEventType.CARD_TAKES_DAMAGE, validLocations)
			.require(({ triggeringCard }) => triggeringCard === this)
			.require(({ triggeringCard }) => triggeringCard.power <= 0)
			.require(({ triggeringCard, powerDamageInstance }) => (powerDamageInstance && powerDamageInstance.value > 0) || triggeringCard.armor === 0)
			.perform(() => this.destroy())
	}

	public get unitCost(): number {
		let cost = 1
		this.buffs.buffs.forEach(buff => {
			cost = buff.getUnitCostOverride(cost)
		})
		return cost
	}

	public get spellCost(): number {
		let cost = this.power
		this.buffs.buffs.forEach(buff => {
			cost = buff.getSpellCostOverride(cost)
		})
		return cost
	}

	public get tribes(): CardTribe[] {
		let tribes = this.baseTribes.slice()
		this.buffs.buffs.forEach(buff => {
			tribes = tribes.concat(buff.cardTribes.slice())
		})
		return tribes
	}

	public get features(): CardFeature[] {
		let features = this.baseFeatures.slice()
		this.buffs.buffs.forEach(buff => {
			features = features.concat(buff.cardFeatures.slice())
		})
		return features
	}

	public get unit(): ServerUnit | null {
		return this.game.board.findUnitById(this.id)
	}

	public get owner(): ServerPlayerInGame | null {
		const thisCardInGame = this.game.findOwnedCardById(this.id)
		return thisCardInGame ? thisCardInGame.owner : null
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

	public get deckPosition(): number {
		const owner = this.owner
		if (!owner) {
			return -1
		}
		return owner.cardDeck.getCardIndex(this)
	}

	public isCollectible(): boolean {
		return this.faction !== CardFaction.EXPERIMENTAL && this.color !== CardColor.TOKEN && this.type === CardType.UNIT
	}

	public instanceOf(prototype: CardConstructor): boolean {
		const cardClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
		return this.class === cardClass
	}

	public setPower(value: number): void {
		if (this.power === value) { return }

		this.power = Math.min(value, this.maxPower)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardPowerChange(playerInGame.player, this)
		})
	}

	public setMaxPower(value: number): void {
		if (this.maxPower === value) { return }

		this.maxPower = Math.max(value, 0)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardMaxPowerChange(playerInGame.player, this)
		})
		if (this.power > this.maxPower) {
			this.setPower(this.maxPower)
		}
	}

	public setArmor(value: number): void {
		if (this.armor === value) { return }

		this.armor = Math.min(value, this.maxArmor)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardArmorChange(playerInGame.player, this)
		})
	}

	public setMaxArmor(value: number): void {
		if (this.maxArmor === value) { return }

		this.maxArmor = Math.max(value, 0)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardMaxArmorChange(playerInGame.player, this)
		})
		if (this.armor > this.maxArmor) {
			this.setArmor(this.maxArmor)
		}
	}

	public dealDamage(originalDamageInstance: ServerDamageInstance): void {
		const hookValues = this.game.events.applyHooks<CardTakesDamageHookArgs, CardTakesDamageHookValues>(GameHookType.CARD_TAKES_DAMAGE, {
			targetCard: this,
			damageInstance: originalDamageInstance,
		})

		const { targetCard, damageInstance } = hookValues

		if (damageInstance.value <= 0) {
			return
		}

		if (damageInstance.sourceCard) {
			this.game.animation.play(ServerAnimation.cardAttacksCards(damageInstance.sourceCard, [this]))
			if (targetCard !== this) {
				this.game.animation.play(ServerAnimation.cardAttacksCards(this, [targetCard]))
			}
		} else {
			this.game.animation.play(ServerAnimation.universeAttacksCards([this]))
			if (targetCard !== this) {
				this.game.animation.play(ServerAnimation.cardAttacksCards(this, [targetCard]))
			}
		}

		let damageToDeal = damageInstance.value

		let armorDamageInstance: ServerDamageInstance | null = null
		if (targetCard.armor > 0) {
			armorDamageInstance = damageInstance.clone()
			armorDamageInstance.value = Math.min(targetCard.armor, damageToDeal)
			damageToDeal -= armorDamageInstance.value
		}

		let powerDamageInstance: ServerDamageInstance | null = null
		if (damageToDeal > 0) {
			powerDamageInstance = damageInstance.clone()
			powerDamageInstance.value = Math.min(targetCard.power, damageToDeal)
		}

		if (armorDamageInstance) {
			targetCard.setArmor(targetCard.armor - armorDamageInstance.value)
		}

		if (powerDamageInstance) {
			targetCard.setPower(targetCard.power - powerDamageInstance.value)
		}

		this.game.events.postEvent(GameEventCreators.cardTakesDamage({
			triggeringCard: targetCard,
			damageInstance: damageInstance,
			armorDamageInstance: armorDamageInstance,
			powerDamageInstance: powerDamageInstance
		}))
	}

	public destroy(): void {
		const unit = this.unit
		if (this.unit) {
			unit.destroy()
			return
		}

		if (this.isBeingDestroyed) {
			return
		}

		this.isBeingDestroyed = true

		const hookValues = this.game.events.applyHooks<CardDestroyedHookValues, CardDestroyedHookArgs>(GameHookType.CARD_DESTROYED, {
			destructionPrevented: false
		}, {
			targetCard: this
		})

		if (hookValues.destructionPrevented) {
			this.setPower(1)
			this.isBeingDestroyed = false
			return
		}

		this.game.events.postEvent(GameEventCreators.cardDestroyed({
			triggeringCard: this,
		}))

		const owner = this.owner
		const location = this.location
		if (location === CardLocation.HAND) {
			owner.cardHand.removeCard(this)
		} else if (location === CardLocation.DECK) {
			owner.cardDeck.removeCard(this)
		} else if (location === CardLocation.GRAVEYARD) {
			owner.cardGraveyard.removeCard(this)
		}
		this.isBeingDestroyed = false
	}

	public reveal(owner: ServerPlayerInGame, opponent: ServerPlayerInGame): void {
		if (this.isRevealed) { return }

		this.isRevealed = true
		runCardEventHandler(() => this.onRevealed(owner))
		OutgoingMessageHandlers.notifyAboutOpponentCardRevealed(opponent.player, this)
	}

	public getValidPlayTargets(cardOwner: ServerPlayerInGame): ServerCardTarget[] {
		if ((this.type === CardType.UNIT && cardOwner.unitMana < this.unitCost) || (this.type === CardType.SPELL && cardOwner.spellMana < this.spellCost)) {
			return []
		}

		return this.getValidTargets(TargetMode.ON_PLAY_VALID_TARGET, TargetType.BOARD_ROW, this.getPlayValidTargetDefinition(), {
			thisCardOwner: cardOwner
		})
	}

	public getValidPostPlayRequiredTargets(previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		let validTargets = []
		const args = {
			thisUnit: this.unit,
			thisCardOwner: this.owner
		}
		const targetDefinition = this.definePostPlayRequiredTargets().build()
		Utils.forEachInNumericEnum(TargetType, (targetType: TargetType) => {
			validTargets = validTargets.concat(this.getValidTargets(TargetMode.POST_PLAY_REQUIRED_TARGET, targetType, targetDefinition, args, previousTargets))
		})
		return validTargets
	}

	public getValidTargets(targetMode: TargetMode, targetType: TargetType, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		let targets: ServerCardTarget[] = []
		if (targetType === TargetType.UNIT) {
			targets = this.getValidUnitTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.BOARD_ROW) {
			targets = this.getValidRowTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.CARD_IN_LIBRARY) {
			targets = this.getValidCardLibraryTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.CARD_IN_UNIT_HAND) {
			targets = this.getValidUnitHandTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.CARD_IN_SPELL_HAND) {
			targets = this.getValidSpellHandTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.CARD_IN_UNIT_DECK) {
			targets = this.getValidUnitDeckTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.CARD_IN_SPELL_DECK) {
			targets = this.getValidSpellDeckTargets(targetMode, targetDefinition, args, previousTargets)
		}

		if (args.thisCardOwner) {
			targets.forEach(target => target.sourceCardOwner = args.thisCardOwner)
		}
		if (args.thisUnit) {
			targets.forEach(target => target.sourceUnit = args.thisUnit)
		}

		return targets
	}

	private isTargetLimitExceeded(targetMode: TargetMode, targetType: TargetType, targetDefinition: TargetDefinition, previousTargets: ServerCardTarget[]): boolean {
		if (previousTargets.length >= targetDefinition.getTargetCount()) {
			return true
		}

		const previousTargetsOfType = previousTargets.filter(target => target.targetMode === targetMode && target.targetType === targetType)
		return previousTargetsOfType.length >= targetDefinition.getTargetOfTypeCount(targetMode, targetType)
	}

	private getValidUnitTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.UNIT, targetDefinition, previousTargets)) {
			return []
		}

		const unitTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.UNIT)
		args = {
			...args,
			thisCard: this,
			previousTargets: previousTargets
		}

		return this.game.board.getAllUnits()
			.filter(unit => !unit.card.features.includes(CardFeature.UNTARGETABLE))
			.filter(unit => targetDefinition.validate(targetMode, TargetType.UNIT, { ...args, targetCard: unit.card, targetUnit: unit }))
			.map(unit => ({
				unit: unit,
				expectedValue: targetDefinition.evaluate(targetMode, TargetType.UNIT, { ...args, targetCard: unit.card, targetUnit: unit })
			}))
			.map(tuple => ({
				unit: tuple.unit,
				expectedValue: Math.max(tuple.expectedValue * tuple.unit.card.botEvaluation.threatMultiplier, tuple.unit.card.botEvaluation.baseThreat)
			}))
			.map(tuple => ServerCardTarget.cardTargetUnit(targetMode, this, tuple.unit, tuple.expectedValue, unitTargetLabel))
	}

	private getValidRowTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.BOARD_ROW, targetDefinition, previousTargets)) {
			return []
		}

		const rowTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.BOARD_ROW)
		return this.game.board.rows
			.filter(row => targetDefinition.validate(targetMode, TargetType.BOARD_ROW, { ...args, thisCard: this, targetRow: row, previousTargets: previousTargets }))
			.map(targetRow => ServerCardTarget.cardTargetRow(targetMode, this, targetRow, rowTargetLabel))
	}

	private getValidCardLibraryTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_LIBRARY, targetDefinition, previousTargets)) {
			return []
		}

		const libraryCards = GameLibrary.cards as ServerCard[]
		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_LIBRARY)
		return libraryCards
			.filter(card => targetDefinition.validate(targetMode, TargetType.CARD_IN_LIBRARY, { ... args, thisCard: this, targetCard: card, previousTargets: previousTargets }))
			.map(targetCard => ServerCardTarget.cardTargetCardInLibrary(targetMode, this, targetCard, cardTargetLabel))
	}

	private getValidUnitHandTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_UNIT_HAND, targetDefinition, previousTargets)) {
			return []
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_UNIT_HAND)
		return this.game.players.map(player => player.cardHand.unitCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter(unit => !unit.features.includes(CardFeature.UNTARGETABLE))
			.filter(card => targetDefinition.validate(targetMode, TargetType.CARD_IN_UNIT_HAND, { ... args, thisCard: this, targetCard: card, previousTargets: previousTargets }))
			.map(targetCard => ServerCardTarget.cardTargetCardInUnitHand(targetMode, this, targetCard, cardTargetLabel))
	}

	private getValidSpellHandTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_SPELL_HAND, targetDefinition, previousTargets)) {
			return []
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_SPELL_HAND)
		return this.game.players.map(player => player.cardHand.spellCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter(unit => !unit.features.includes(CardFeature.UNTARGETABLE))
			.filter(card => targetDefinition.validate(targetMode, TargetType.CARD_IN_SPELL_HAND, { ... args, thisCard: this, targetCard: card, previousTargets: previousTargets }))
			.map(targetCard => ServerCardTarget.cardTargetCardInSpellHand(targetMode, this, targetCard, cardTargetLabel))
	}

	private getValidUnitDeckTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_UNIT_DECK, targetDefinition, previousTargets)) {
			return []
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_UNIT_DECK)
		return this.game.players.map(player => player.cardDeck.unitCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter(card => targetDefinition.validate(targetMode, TargetType.CARD_IN_UNIT_DECK, { ... args, thisCard: this, targetCard: card, previousTargets: previousTargets }))
			.map(targetCard => ServerCardTarget.cardTargetCardInUnitDeck(targetMode, this, targetCard, cardTargetLabel))
	}

	private getValidSpellDeckTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_SPELL_DECK, targetDefinition, previousTargets)) {
			return []
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_SPELL_DECK)
		return this.game.players.map(player => player.cardDeck.spellCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter(card => targetDefinition.validate(targetMode, TargetType.CARD_IN_SPELL_DECK, { ... args, thisCard: this, targetCard: card, previousTargets: previousTargets }))
			.map(targetCard => ServerCardTarget.cardTargetCardInSpellDeck(targetMode, this, targetCard, cardTargetLabel))
	}

	public getPlayValidTargetDefinition(): TargetDefinition {
		let targets = this.definePlayValidTargets()
		this.buffs.buffs.forEach(buff => {
			targets = targets.merge(buff.definePlayValidTargetsMod())
			targets = buff.definePlayValidTargetsOverride(targets)
		})
		return targets.build()
	}

	public getValidOrderTargetDefinition(): TargetDefinition {
		let targets = this.defineValidOrderTargets()
		this.buffs.buffs.forEach(buff => {
			targets = targets.merge(buff.defineValidOrderTargetsMod())
			targets = buff.defineValidOrderTargetsOverride(targets)
		})
		return targets.build()
	}

	public getPostPlayRequiredTargetDefinition(): TargetDefinition {
		let targets = this.definePostPlayRequiredTargets()
		this.buffs.buffs.forEach(buff => {
			targets = targets.merge(buff.definePostPlayRequiredTargetsMod())
			targets = buff.definePostPlayRequiredTargetsOverride(targets)
		})
		return targets.build()
	}

	public evaluateVariables(): RichTextVariables {
		const evaluatedVariables: RichTextVariables = {}
		Object.keys(this.dynamicTextVariables).forEach(key => {
			const value = this.dynamicTextVariables[key]
			if (typeof(value) === 'function') {
				evaluatedVariables[key] = value()
			} else {
				evaluatedVariables[key] = value
			}
		})
		return evaluatedVariables
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
	protected createCallback<ArgsType>(eventType: GameEventType, location: CardLocation[]): EventCallback<ArgsType> {
		return this.game.events.createCallback<ArgsType>(this, eventType)
			.requireLocations(location)
	}

	/* Subscribe to a game event triggered by this buff
	 * ------------------------------------------------
	 * `createEffect` is equivalent to `createCallback`, but it will only trigger when
	 * the `effectSource` is set to the subscriber.
	 */
	protected createEffect<ArgsType>(event: GameEventType): EventCallback<ArgsType> {
		return this.game.events.createCallback<ArgsType>(this, event)
			.require((args, rawEvent) => rawEvent.effectSource && rawEvent.effectSource === this)
	}

	/* Subscribe to a game hook
	 * ------------------------
	 * Game hooks are callbacks that allow the event to be modified. For example, using the
	 * `GameHookType.CARD_TAKES_DAMAGE` hook it is possible to increase or decrease the damage a card
	 * takes from any source.
	 *
	 * The hook will only trigger if the subscriber is located in one of the locations specified by `location` argument.
	 */
	protected createHook<HookValues, HookArgs>(hookType: GameHookType, location: CardLocation[]): EventHook<HookValues, HookArgs> {
		return this.game.events.createHook<HookValues, HookArgs>(this, hookType)
			.requireLocations(location)
	}

	onRevealed(owner: ServerPlayerInGame): void { return }

	onUnitCustomOrderPerformed(thisUnit: ServerUnit, order: ServerCardTarget): void { return }
	onBeforeUnitOrderIssued(thisUnit: ServerUnit, order: ServerCardTarget): void { return }
	onAfterUnitOrderIssued(thisUnit: ServerUnit, order: ServerCardTarget): void { return }
	onBeforePerformingUnitAttack(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode): void { return }
	onPerformingUnitAttack(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode): void { return }
	onAfterPerformingUnitAttack(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode): void { return }
	onBeforePerformingRowAttack(thisUnit: ServerUnit, target: ServerBoardRow, targetMode: TargetMode): void { return }
	onAfterPerformingRowAttack(thisUnit: ServerUnit, target: ServerBoardRow, targetMode: TargetMode): void { return }
	onBeforeBeingAttacked(thisUnit: ServerUnit, attacker: ServerUnit): void { return }
	onAfterBeingAttacked(thisUnit: ServerUnit, attacker: ServerUnit): void { return }
	onBeforePerformingMove(thisUnit: ServerUnit, target: ServerBoardRow, from: ServerBoardRow): void { return }
	onAfterPerformingMove(thisUnit: ServerUnit, target: ServerBoardRow, from: ServerBoardRow): void { return }
	onPerformingUnitSupport(thisUnit: ServerUnit, target: ServerUnit): void { return }
	onPerformingRowSupport(thisUnit: ServerUnit, target: ServerBoardRow): void { return }
	onBeforeBeingSupported(thisUnit: ServerUnit, support: ServerUnit): void { return }
	onAfterBeingSupported(thisUnit: ServerUnit, support: ServerUnit): void { return }

	getAttackDamage(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode, targetType: TargetType): number { return this.attack }
	getBonusAttackDamage(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode, targetType: TargetType): number { return 0 }

	getDeckAddedUnitCards(): any[] { return [] }
	getDeckAddedSpellCards(): any[] { return [] }

	definePlayValidTargets(): TargetDefinitionBuilder { return TargetDefinition.defaultCardPlayTarget(this.game) }
	defineValidOrderTargets(): TargetDefinitionBuilder { return TargetDefinition.defaultUnitOrder(this.game) }
	definePostPlayRequiredTargets(): TargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	isRequireCustomOrderLogic(thisUnit: ServerUnit, order: ServerCardTarget): boolean { return false }
}
