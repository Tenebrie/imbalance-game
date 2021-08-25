import PlayerInGame from '../../PlayerInGame'

export default class PlayerInGameManaMessage {
	public readonly playerId: string
	public readonly unitMana: number
	public readonly spellMana: number

	constructor(playerInGame: PlayerInGame) {
		this.playerId = playerInGame.player.id
		this.unitMana = playerInGame.unitMana
		this.spellMana = playerInGame.spellMana
	}
}
