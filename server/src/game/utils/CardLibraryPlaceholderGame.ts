import ServerGame from '../models/ServerGame'
import GameMode from '@shared/enums/GameMode'

let instance: ServerGame | null = null

export default {
	get(): ServerGame {
		if (!instance) {
			instance = new ServerGame({
				name: 'Card Library Placeholder Game',
				gameMode: GameMode.VS_AI
			})
		}
		return instance
	}
}
