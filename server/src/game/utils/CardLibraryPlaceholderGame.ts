import ServerGame from '../models/ServerGame'

let instance: ServerGame | null = null

export default {
	get(): ServerGame {
		if (!instance) {
			instance = new ServerGame({
				name: 'Card Library Placeholder Game'
			})
		}
		return instance
	}
}
