import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import BuffVelRamineaWeave from '../../../../buffs/BuffVelRamineaWeave'
import BuffDuration from '@shared/enums/BuffDuration'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'

export default class SpellFlameweave extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.EXPERIMENTAL)

		this.basePower = 1
		this.baseFeatures = [CardFeature.HERO_POWER]
		this.dynamicTextVariables = {
			currentStacks: () => this.currentStacks
		}

		this.createCallback(GameEventType.EFFECT_SPELL_PLAY)
			.perform(() => {
				this.owner.leader.buffs.add(BuffVelRamineaWeave, this, BuffDuration.INFINITY)
			})
	}

	get currentStacks(): number {
		return this.game.getTotalBuffIntensityForPlayer(BuffVelRamineaWeave, this.owner, [CardLocation.LEADER])
	}
}
