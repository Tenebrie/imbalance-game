import Constants from '@shared/Constants'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

import GwentAlzursThunder from '../bronze/GwentAlzursThunder'
import GwentBitingFrost from '../bronze/GwentBitingFrost'
import GwentImpenetrableFog from '../bronze/GwentImpenetrableFog'

export default class GwentVaedermakar extends ServerCard {
	exploredCards: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.MAGE],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Vaedermakar`,
				description: `*Spawn* *Biting Frost*, *Impenetrable Fog* or *Alzur's Thunder*.`,
				flavor: `The druid Vaedermakar controls the elements. He soothes storms into silence, musters destructive hail, summons lightning to turn foes into ash. So I advise you well… treat him with utmost respect.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const validCards = CardLibrary.cards
				.filter((card) => card instanceof GwentBitingFrost || card instanceof GwentImpenetrableFog || card instanceof GwentAlzursThunder)
				.slice()
			this.exploredCards = getMultipleRandomArrayValues(validCards, Constants.CREATE_KEYWORD_CARD_COUNT)
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => this.exploredCards.includes(targetCard))
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
				this.exploredCards = []
			})
	}
}
