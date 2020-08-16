import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import SpellAnEncouragement from '../cards/arcane/leaders/VelElleron/SpellAnEncouragement'
import BuffStrength from './BuffStrength'
import ServerGame from '../models/ServerGame'
import {TurnStartedEventArgs} from '../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffVelElleronEncouragement extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
		this.alignment = BuffAlignment.POSITIVE

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		const bonusPower = SpellAnEncouragement.bonusPower
		for (let i = 0; i < bonusPower; i++) {
			this.card.buffs.add(BuffStrength, this.source)
		}
		this.card.buffs.removeByReference(this)
	}
}
