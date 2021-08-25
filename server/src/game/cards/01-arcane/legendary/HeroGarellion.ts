import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroGarellion extends ServerCard {
	powerPerMana = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_INFUSE_ALL],
			stats: {
				power: 20,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			powerPerMana: this.powerPerMana,
		}

		this.createCallback(GameEventType.ROUND_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => this.onRoundEnded())
	}

	private onRoundEnded(): void {
		const consumedMana = this.ownerPlayerInGame.spellMana
		this.ownerPlayerInGame.setSpellMana(0)
		for (let i = 0; i < consumedMana * this.powerPerMana; i++) {
			this.game.animation.createAnimationThread()
			this.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
			this.game.animation.commitAnimationThread()
		}
	}
}
