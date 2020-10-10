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
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class SpellFlameweave extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 1
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})
		this.dynamicTextVariables = {
			currentStacks: () => this.currentStacks
		}

		this.createEffect(GameEventType.SPELL_DEPLOYED)
			.perform(() => {
				this.ownerInGame.leader.buffs.add(BuffVelRamineaWeave, this, BuffDuration.INFINITY)
			})
	}

	get currentStacks(): number {
		const owner = this.owner
		if (!owner) {
			return 0
		}
		return this.game.getTotalBuffIntensityForPlayer(BuffVelRamineaWeave, owner, [CardLocation.LEADER])
	}
}
