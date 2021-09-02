import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitFelineSpy from '@src/game/cards/02-wild/tokens/UnitFelineSpy'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroFelineSaint extends ServerCard {
	public static readonly CATS_CREATED = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.WILD,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE],
			stats: {
				power: 7,
			},
			relatedCards: [UnitFelineSpy],
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			catsCreated: HeroFelineSaint.CATS_CREATED,
		}

		this.createLocalization({
			en: {
				name: 'Catissian',
				title: 'The Feline Saint',
				description: '*Deploy:*<br>*Create* {catsCreated} *Feline Spies*.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			for (let i = 0; i < HeroFelineSaint.CATS_CREATED; i++) {
				Keywords.createCard.forOwnerOf(this).fromConstructor(UnitFelineSpy)
			}
		})
	}
}
