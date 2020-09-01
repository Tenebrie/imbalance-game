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
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.EXPERIMENTAL,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 1
			}
		})
		this.dynamicTextVariables = {
			currentStacks: () => this.currentStacks
		}

		this.createEffect(GameEventType.SPELL_DEPLOYED)
			.perform(() => {
				this.owner.leader.buffs.add(BuffVelRamineaWeave, this, BuffDuration.INFINITY)
			})
	}

	get currentStacks(): number {
		return this.game.getTotalBuffIntensityForPlayer(BuffVelRamineaWeave, this.owner, [CardLocation.LEADER])
	}
}
