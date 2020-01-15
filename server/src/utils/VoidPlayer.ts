import ServerPlayer from '../libraries/players/ServerPlayer'

let voidPlayer: VoidPlayer

export default class VoidPlayer extends ServerPlayer {
	constructor() {
		super('void', '/dev/null')
	}

	sendMessage(json: { type: string; data: any }): void {
		return
	}

	public static get(): VoidPlayer {
		if (!voidPlayer) {
			voidPlayer = new VoidPlayer()
		}
		return voidPlayer
	}
}
