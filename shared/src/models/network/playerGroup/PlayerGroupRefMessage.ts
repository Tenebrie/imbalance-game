import PlayerGroup from '../../PlayerGroup'

export default class PlayerGroupRefMessage {
	id: string

	constructor(group: PlayerGroup) {
		this.id = group.id
	}
}
