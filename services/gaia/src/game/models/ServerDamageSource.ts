import DamageSource from '@shared/enums/DamageSource'
import ServerBoardRow from '@src/game/models/ServerBoardRow'

import ServerCard from './ServerCard'
import ServerUnit from './ServerUnit'

type NumberOrGetter = number | ((card: ServerCard) => number)

const collapseValue = (value: NumberOrGetter, sourceCard: ServerCard) => {
	if (typeof value === 'function') {
		return value(sourceCard)
	}
	return value
}

export const cloneDamageInstance = <T extends ServerCardDamageInstance | ServerBoardRowDamageInstance | ServerUniverseDamageInstance>(
	instance: T,
	overrides: Partial<{ value: number }> = {}
): T => {
	const value = overrides.value ?? instance.value
	switch (instance.source) {
		case DamageSource.CARD:
			const cardInstance = instance as ServerCardDamageInstance
			return new ServerCardDamageInstance(value, cardInstance.sourceCard, null, instance.redirectHistory) as T
		case DamageSource.BOARD_ROW:
			const boardRowInstance = instance as ServerBoardRowDamageInstance
			return new ServerBoardRowDamageInstance(value, boardRowInstance.sourceRow, null, instance.redirectHistory) as T
		case DamageSource.UNIVERSE:
			return new ServerUniverseDamageInstance(value, null, instance.redirectHistory) as T
	}
}

export const redirectDamageInstance = <T extends ServerCardDamageInstance | ServerBoardRowDamageInstance | ServerUniverseDamageInstance>(
	instance: T,
	proxyCard: ServerCard
): T => {
	switch (instance.source) {
		case DamageSource.CARD:
			const cardInstance = instance as ServerCardDamageInstance
			return new ServerCardDamageInstance(cardInstance.value, cardInstance.sourceCard, proxyCard, instance.redirectHistory) as T
		case DamageSource.BOARD_ROW:
			const boardRowInstance = instance as ServerBoardRowDamageInstance
			return new ServerBoardRowDamageInstance(boardRowInstance.value, boardRowInstance.sourceRow, proxyCard, instance.redirectHistory) as T
		case DamageSource.UNIVERSE:
			const universeInstance = instance as ServerUniverseDamageInstance
			return new ServerUniverseDamageInstance(universeInstance.value, proxyCard, instance.redirectHistory) as T
	}
}

class BaseDamageInstance {
	public readonly value: number
	public readonly proxyCard: ServerCard | null = null
	public readonly redirectHistory: ServerCard[] = []

	public constructor(value: number, proxyCard: ServerCard | null, redirectHistory: ServerCard[]) {
		this.value = value
		this.proxyCard = proxyCard
		this.redirectHistory = proxyCard ? redirectHistory.concat(proxyCard) : redirectHistory
	}
}

export class ServerCardDamageInstance extends BaseDamageInstance {
	public readonly source = DamageSource.CARD
	public readonly sourceCard: ServerCard

	public constructor(value: number, sourceCard: ServerCard, proxyCard: ServerCard | null = null, redirectHistory: ServerCard[] = []) {
		super(value, proxyCard, redirectHistory)
		this.sourceCard = sourceCard
	}
}

export class ServerBoardRowDamageInstance extends BaseDamageInstance {
	public readonly source = DamageSource.BOARD_ROW
	public readonly sourceRow: ServerBoardRow

	public constructor(value: number, sourceRow: ServerBoardRow, proxyCard: ServerCard | null = null, redirectHistory: ServerCard[] = []) {
		super(value, proxyCard, redirectHistory)
		this.sourceRow = sourceRow
	}
}

export class ServerUniverseDamageInstance extends BaseDamageInstance {
	public readonly source = DamageSource.UNIVERSE

	public constructor(value: number, proxyCard: ServerCard | null = null, redirectHistory: ServerCard[] = []) {
		super(value, proxyCard, redirectHistory)
	}
}

export class DamageInstance {
	public static fromCard(value: NumberOrGetter, sourceCard: ServerCard): ServerCardDamageInstance {
		return new ServerCardDamageInstance(collapseValue(value, sourceCard), sourceCard)
	}

	public static fromUnit(value: NumberOrGetter, sourceUnit: ServerUnit): ServerCardDamageInstance {
		return new ServerCardDamageInstance(collapseValue(value, sourceUnit.card), sourceUnit.card)
	}

	public static fromRow(value: number, sourceRow: ServerBoardRow): ServerBoardRowDamageInstance {
		return new ServerBoardRowDamageInstance(value, sourceRow)
	}

	public static fromUniverse(value: number): ServerUniverseDamageInstance {
		return new ServerUniverseDamageInstance(value)
	}

	public static redirectedFrom(original: ServerDamageInstance, proxy: ServerCard): ServerDamageInstance {
		return redirectDamageInstance(original, proxy)
	}
}

type ServerDamageInstance = ServerCardDamageInstance | ServerBoardRowDamageInstance | ServerUniverseDamageInstance

export default ServerDamageInstance
