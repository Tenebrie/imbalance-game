import path from 'path'
import glob from 'glob'
import ServerCard from '../models/ServerCard'
import ServerGame from '../models/ServerGame'
import VoidGame from '../utils/VoidGame'

export default class GameLibrary {
	static cards: ServerCard[]

	constructor() {
		const cardPrototypes = []

		const normalizedPath = path.join(__dirname, '../cards')
		const cardModules = glob.sync(`${normalizedPath}/**/*.js`)
		cardModules.forEach(file => cardPrototypes.push(require(file).default))
		console.info(`Loaded ${cardPrototypes.length} card definitions`)

		GameLibrary.cards = cardPrototypes.map(prototype => {
			const referenceInstance = new prototype(VoidGame.get())
			const className = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
			referenceInstance.class = className
			referenceInstance.power = referenceInstance.basePower
			referenceInstance.attack = referenceInstance.baseAttack
			referenceInstance.name = `card.name.${className}`
			referenceInstance.title = `card.title.${className}`
			referenceInstance.description = `card.description.${className}`
			return referenceInstance
		})
	}

	public static get collectibleCards(): ServerCard[] {
		const cards = this.cards as ServerCard[]
		return cards.filter(card => card.isCollectible())
	}

	public static findPrototypeById(id: string): ServerCard | null {
		return this.cards.find(card => card.id === id)
	}

	public static instantiateByInstance(game: ServerGame, card: ServerCard): ServerCard {
		const cardClass = card.constructor.name.substr(0, 1).toLowerCase() + card.constructor.name.substr(1)
		return this.instantiateByClass(game, cardClass)
	}

	public static instantiateByConstructor(game: ServerGame, prototype: Function): ServerCard {
		const cardClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
		return this.instantiateByClass(game, cardClass)
	}

	public static instantiateByClass(game: ServerGame, cardClass: string): ServerCard {
		const reference = GameLibrary.cards.find(card => {
			return card.class === cardClass
		})
		if (!reference) {
			console.error(`No registered card with class '${cardClass}'!`)
			throw new Error(`No registered card with class '${cardClass}'!`)
		}

		// @ts-ignore
		const clone: ServerCard = new reference.constructor(game)
		clone.type = reference.type
		clone.class = cardClass

		clone.name = reference.name
		clone.title = reference.title
		clone.baseTribes = (reference.baseTribes || []).slice()
		clone.baseFeatures = (reference.baseFeatures || []).slice()
		clone.description = reference.description
		clone.game = game
		clone.power = clone.basePower
		clone.attack = clone.baseAttack
		clone.attackRange = clone.baseAttackRange
		clone.armor = clone.baseArmor
		return clone
	}
}
