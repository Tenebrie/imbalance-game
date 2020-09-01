import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import {TurnStartedEventArgs} from '../models/GameEventCreators'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffDecayingArmor extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.alignment = BuffAlignment.POSITIVE

		this.createEffect(GameEventType.BUFF_CREATED)
			.perform(() => this.onCreated())

		this.createEffect(GameEventType.BUFF_REMOVED)
			.perform(() => this.onDestroyed())

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnStarted())
	}

	private onCreated(): void {
		this.card.stats.maxArmor = this.card.stats.maxArmor + 1
	}

	private onDestroyed(): void {
		this.card.stats.maxArmor = this.card.stats.maxArmor - 1
	}

	private onTurnStarted(): void {
		this.setIntensity(this.intensity - 1)
	}
}
