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
import CardFeature from '@shared/enums/CardFeature'

export default class HeroGarellion extends ServerCard {
	powerPerMana = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_INFUSE_ALL],
			stats: {
				power: 12
			}
		})
		this.dynamicTextVariables = {
			powerPerMana: this.powerPerMana
		}

		this.createCallback<RoundEndedEventArgs>(GameEventType.ROUND_ENDED, [CardLocation.BOARD])
			.require(({ player }) => player === this.owner)
			.perform(() => this.onRoundEnded())
	}

	private onRoundEnded(): void {
		const thisUnit = this.unit
		const consumedMana = thisUnit.owner.spellMana
		thisUnit.owner.setSpellMana(0)
		for (let i = 0; i < consumedMana * this.powerPerMana; i++) {
			this.game.animation.createStaggeredAnimationThread()
			thisUnit.buffs.add(BuffStrength, thisUnit.card, BuffDuration.INFINITY)
			this.game.animation.commitAnimationThread()
		}
	}
}
