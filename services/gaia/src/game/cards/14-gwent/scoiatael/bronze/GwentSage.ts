import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentDoomed from '@src/game/buffs/14-gwent/BuffGwentDoomed'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentSage extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.MAGE, CardTribe.ELF],
			stats: {
				power: 2,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Sage`,
				description: `*Resurrect* a Bronze Alchemy or Spell card, then *Banish* it.`,
				flavor: `Knowledge, my dear, is a privilege, and privileges are only shared among equals.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_GRAVEYARD)
			.requireAllied()
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE)
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.ALCHEMY) || targetCard.tribes.includes(CardTribe.SPELL))
			.perform(({ targetCard, player }) => {
				targetCard.buffs.add(BuffGwentDoomed, this)
				Keywords.playCardFromGraveyard(targetCard, player)
			})
	}
}
