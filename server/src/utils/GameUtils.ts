import ServerCard from '../game/models/ServerCard'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import {CardConstructor} from '../game/libraries/CardLibrary'
import ServerUnit from '../game/models/ServerUnit'

export const unitOf = (card: ServerCard): ServerUnit => {
	return card.unit!
}

export const ownerOf = (card: ServerCard): ServerPlayerInGame => {
	return card.owner!
}

export const opponentOf = (card: ServerCard): ServerPlayerInGame => {
	return card.owner!.opponent!
}

export const createCardFromInstance = (context: ServerCard, instance: ServerCard): ServerCard => {
	return context.owner!.createCardFromLibraryFromInstance(instance)
}

export const createCardFromLibrary = (context: ServerCard, prototype: CardConstructor): ServerCard => {
	return context.owner!.createCardFromLibraryFromPrototype(prototype)
}
