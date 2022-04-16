import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import BuffStrength from '../../../buffs/BuffStrength'

// TODO: Rework me
// It also does not trigger after opponent has finished the round
export default class HeroGarellion extends ServerCard {
	powerPerMana = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			stats: {
				power: 20,
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})
		this.dynamicTextVariables = {
			powerPerMana: this.powerPerMana,
		}

		this.createCallback(GameEventType.ROUND_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => this.onRoundEnded())
	}

	private onRoundEnded(): void {
		const consumedMana = this.ownerPlayer.spellMana
		this.ownerPlayer.setSpellMana(0, this)
		for (let i = 0; i < consumedMana * this.powerPerMana; i++) {
			this.game.animation.createAnimationThread()
			this.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
			this.game.animation.commitAnimationThread()
		}
	}
}
