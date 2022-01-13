import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import SpellScrollOfGrowth from '@src/game/cards/01-arcane/tokens/SpellScrollOfGrowth'

import BuffGrowth from '../../../buffs/BuffGrowth'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'

export default class TutorialSpellScrollOfGrowth extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SCROLL],
			stats: {
				cost: 2,
			},
			sharedArtwork: SpellScrollOfGrowth,
			expansionSet: ExpansionSet.TUTORIAL,
		})

		this.createLocalization({
			en: {
				name: 'Scroll of Growth',
				description: 'Apply *Growth* to an allied unit.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.buffs.add(BuffGrowth, this, BuffDuration.INFINITY)
	}
}
