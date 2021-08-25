import PlayerGroup from '../../PlayerGroup'

export default class PlayerGroupResourcesMessage {
	public readonly playerGroupId: string
	public readonly roundWins: number

	constructor(playerGroup: PlayerGroup) {
		this.playerGroupId = playerGroup.id
		this.roundWins = playerGroup.roundWins
	}
}
