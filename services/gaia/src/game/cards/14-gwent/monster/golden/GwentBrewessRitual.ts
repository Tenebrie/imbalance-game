import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentBrewessRitual extends ServerCard {
	public static readonly TARGETS = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.MAGE, CardTribe.RELICT, CardTribe.DOOMED],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			targets: GwentBrewessRitual.TARGETS,
		}

		this.createLocalization({
			en: {
				name: 'Brewess: Ritual',
				description: '*Resurrect* {targets} Bronze *Deathwish* units.',
				flavor: "We'll cut you up, boy. A fine broth you'll make.",
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_GRAVEYARD)
			.targetCount(GwentBrewessRitual.TARGETS)
			.requireAllied()
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE)
			.require(({ targetCard }) => targetCard.features.includes(CardFeature.HAS_DEATHWISH))
			.perform(({ targetCard, player }) => {
				Keywords.playCardFromGraveyard(targetCard, player)
			})
	}
}
