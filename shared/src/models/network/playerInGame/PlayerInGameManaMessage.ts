import PlayerInGame from '../../PlayerInGame'

export default class PlayerInGameMessage {
	public readonly playerId: string
	public readonly morale: number
	public readonly unitMana: number
	public readonly spellMana: number

	constructor(playerInGame: PlayerInGame) {
		this.playerId = playerInGame.player.id
		this.morale = playerInGame.morale
		this.unitMana = playerInGame.unitMana
		this.spellMana = playerInGame.spellMana
	}
}
