import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import SpellAnEncouragement from '../cards/arcane/leaders/VelElleron/SpellAnEncouragement'
import BuffStrength from './BuffStrength'
import ServerGame from '../models/ServerGame'

export default class BuffVelElleronEncouragement extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
	}

	onTurnStarted(): void {
		const bonusPower = SpellAnEncouragement.bonusPower
		for (let i = 0; i < bonusPower; i++) {
			this.card.buffs.add(BuffStrength, this.source)
		}
	}
}
