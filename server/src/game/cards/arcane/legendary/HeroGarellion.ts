import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import {RoundEndedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'

export default class HeroGarellion extends ServerCard {
	powerPerMana = 2

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 12
		this.dynamicTextVariables = {
			powerPerMana: this.powerPerMana
		}

		this.createCallback<RoundEndedEventArgs>(GameEventType.ROUND_ENDED)
			.requireLocation(CardLocation.BOARD)
			.require(({ player }) => player === this.owner)
			.perform(() => this.onRoundEnded())
	}

	private onRoundEnded(): void {
		const thisUnit = this.unit
		const consumedMana = thisUnit.owner.spellMana
		thisUnit.owner.setSpellMana(0)
		for (let i = 0; i < consumedMana * this.powerPerMana; i++) {
			thisUnit.buffs.add(BuffStrength, thisUnit.card, BuffDuration.INFINITY)
		}
	}
}
