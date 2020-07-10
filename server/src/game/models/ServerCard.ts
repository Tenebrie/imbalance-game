import uuidv4 from 'uuid/v4'
import Card from '@shared/models/Card'
import CardType from '@shared/enums/CardType'
import ServerGame from './ServerGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerUnit from './ServerUnit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerDamageInstance from './ServerDamageSource'
import ServerDamageSource from './ServerDamageSource'
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
import ServerOwnedCard from './ServerOwnedCard'
import BuffImmunity from '../buffs/BuffImmunity'
import GameLibrary from '../libraries/CardLibrary'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import ServerBuff from './ServerBuff'
import CardLocation from '@shared/enums/CardLocation'
import GameHook, {
	CardDestroyedHookArgs,
	CardDestroyedHookValues,
	CardTakesDamageHookArgs,
	CardTakesDamageHookValues
} from './GameHook'
import GameEvent, {CardDestroyedEventArgs, CardTakesDamageEventArgs} from './GameEvent'
import {EventCallback, EventHook} from './ServerGameEvents'

export default class ServerCard extends Card {
	game: ServerGame
	isRevealed = false
	buffs = new ServerBuffContainer(this)
	dynamicTextVariables: ServerRichTextVariables

	isBeingDestroyed = false

	constructor(game: ServerGame, cardType: CardType, unitSubtype: CardColor, faction: CardFaction) {
		super(uuidv4(), cardType, 'missingno')
		this.game = game
		this.color = unitSubtype
		this.faction = faction
		this.dynamicTextVariables = {}

		this.createCallback<CardTakesDamageEventArgs>(GameEvent.CARD_TAKES_DAMAGE)
			.require(({ targetCard }) => targetCard === this)
			.require(({ targetCard }) => targetCard.power <= 0)
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

	public get maxPower(): number {
		let cost = this.basePower
		this.buffs.buffs.forEach(buff => {
			cost = buff.getUnitMaxPowerOverride(cost)
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

	public instanceOf(prototype: Function): boolean {
		const cardClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
		return this.class === cardClass
	}

	public setPower(value: number): void {
		if (this.power === value) { return }

		this.power = value
		runCardEventHandler(() => this.onPowerChanged(value, this.power))

		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardPowerChange(playerInGame.player, this)
		})
	}

	public setArmor(value: number): void {
		if (this.armor === value) { return }

		runCardEventHandler(() => this.onArmorChanged(value, this.armor))

		this.armor = value
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardArmorChange(playerInGame.player, this)
		})
	}

	public dealDamage(originalDamageInstance: ServerDamageInstance): void {
		const hookValues = this.game.events.applyHooks<CardTakesDamageHookArgs, CardTakesDamageHookValues>(GameHook.CARD_TAKES_DAMAGE, {
			targetCard: this,
			damageInstance: originalDamageInstance,
		})

		const { targetCard, damageInstance } = hookValues

		if (damageInstance.value <= 0) {
			return
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

		this.game.events.postEvent<CardTakesDamageEventArgs>(GameEvent.CARD_TAKES_DAMAGE, {
			targetCard: targetCard,
			damageInstance: damageInstance,
			armorDamageInstance: armorDamageInstance,
			powerDamageInstance: powerDamageInstance
		})
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

		const hookValues = this.game.events.applyHooks<CardDestroyedHookValues, CardDestroyedHookArgs>(GameHook.CARD_DESTROYED, {
			destructionPrevented: false
		}, {
			targetCard: this
		})

		if (hookValues.destructionPrevented) {
			this.setPower(1)
			this.isBeingDestroyed = false
			return
		}

		this.game.events.postEvent<CardDestroyedEventArgs>(GameEvent.CARD_DESTROYED, {
			targetCard: this
		})

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

		/*
		 * All orders are considered to be valid simultaneously
		 * - TODO: Remove allowSimultaneously from targeting API if no other use is found
		 * */
		// const otherTypeOrders = previousTargets.filter(target => target.targetMode !== targetMode || target.targetType !== targetType)
		// const incompatibleOtherTypeOrder = otherTypeOrders.find(performedOrder => {
		// 	return !targetDefinition.isValidSimultaneously({ targetMode, targetType }, performedOrder)
		// })
		// return !!incompatibleOtherTypeOrder
	}

	private getValidUnitTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.UNIT, targetDefinition, previousTargets)) {
			return []
		}

		const unitTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.UNIT)
		return this.game.board.getAllUnits()
			.filter(unit => !unit.card.buffs.has(BuffImmunity))
			.filter(unit => targetDefinition.validate(targetMode, TargetType.UNIT, { ...args, thisCard: this, targetCard: unit.card, targetUnit: unit, previousTargets: previousTargets }))
			.map(targetUnit => ServerCardTarget.cardTargetUnit(targetMode, this, targetUnit, unitTargetLabel))
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

	protected createCallback<ArgsType>(event: GameEvent): EventCallback<ArgsType> {
		return this.game.events.createCallback(this, event)
	}

	protected createHook<HookValues, HookArgs>(hook: GameHook): EventHook<HookValues, HookArgs> {
		return this.game.events.createHook<HookValues, HookArgs>(this, hook)
	}

	onRevealed(owner: ServerPlayerInGame): void { return }

	onUnitPlayTargetCardSelected(thisUnit: ServerUnit, target: ServerCard): void { return }
	onUnitPlayTargetUnitSelected(thisUnit: ServerUnit, target: ServerUnit): void { return }
	onUnitPlayTargetRowSelected(thisUnit: ServerUnit, target: ServerBoardRow): void { return }
	onUnitPlayTargetsConfirmed(thisUnit: ServerUnit): void { return }
	onSpellPlayTargetCardSelected(owner: ServerPlayerInGame, target: ServerCard): void { return }
	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerUnit): void { return }
	onSpellPlayTargetRowSelected(owner: ServerPlayerInGame, target: ServerBoardRow): void { return }
	onSpellPlayTargetsConfirmed(owner: ServerPlayerInGame): void { return }

	onBeforeOtherCardPlayed(otherCard: ServerOwnedCard): void { return }
	onAfterOtherCardPlayed(otherCard: ServerOwnedCard): void { return }
	onOtherCardReceivedNewBuff(otherCard: ServerOwnedCard, buff: ServerBuff): void { return }

	onRoundStarted(): void { return }
	onTurnStarted(): void { return }
	onTurnPhaseChanged(thisUnit: ServerUnit, phase: GameTurnPhase): void { return }
	onTurnEnded(): void { return }
	onRoundEnded(): void { return }
	onUnitCustomOrderPerformed(thisUnit: ServerUnit, order: ServerCardTarget): void { return }
	onBeforeUnitOrderIssued(thisUnit: ServerUnit, order: ServerCardTarget): void { return }
	onAfterUnitOrderIssued(thisUnit: ServerUnit, order: ServerCardTarget): void { return }
	onPowerChanged(newValue: number, oldValue: number): void { return }
	onArmorChanged(newValue: number, oldValue: number): void { return }
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
	getDamageTaken(thisUnit: ServerUnit, damageSource: ServerDamageSource): number { return damageSource.value }
	getDamageReduction(thisUnit: ServerUnit, damageSource: ServerDamageSource): number { return 0 }

	getDeckAddedUnitCards(): any[] { return [] }
	getDeckAddedSpellCards(): any[] { return [] }

	definePlayValidTargets(): TargetDefinitionBuilder { return TargetDefinition.defaultCardPlayTarget(this.game) }
	defineValidOrderTargets(): TargetDefinitionBuilder { return TargetDefinition.defaultUnitOrder(this.game) }
	definePostPlayRequiredTargets(): TargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	isRequireCustomOrderLogic(thisUnit: ServerUnit, order: ServerCardTarget): boolean { return false }
}
