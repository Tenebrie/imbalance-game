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

export default class GwentIthlinneAegli extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
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
				name: `Ithlinne Aegli`,
				description: `Play a Bronze Spell, *Boon* or *Hazard* from your deck twice.`,
				flavor: `Famed for constantly prophesying the world's doom. Not much fun at parties.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE)
			.require(
				({ targetCard }) =>
					targetCard.tribes.includes(CardTribe.SPELL) ||
					targetCard.tribes.includes(CardTribe.BOON) ||
					targetCard.tribes.includes(CardTribe.HAZARD)
			)
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeck(targetCard)
				const secondCopy = Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
				secondCopy.buffs.add(BuffGwentDoomed, this)
				Keywords.playCardFromDeck
			})
	}
}
