import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitStrayCat from '@src/game/cards/09-neutral/tokens/UnitStrayCat'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class HeroFelineSaint extends ServerCard {
	public static readonly CATS_CREATED = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.WILD,
			stats: {
				power: 7,
			},
			relatedCards: [UnitStrayCat],
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			catsCreated: HeroFelineSaint.CATS_CREATED,
		}

		this.createLocalization({
			en: {
				name: 'Catissian',
				title: 'The Feline Saint',
				description: '*Deploy:*<br>*Create* {catsCreated} *Stray Cats*.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			for (let i = 0; i < HeroFelineSaint.CATS_CREATED; i++) {
				Keywords.createCard.forOwnerOf(this).fromConstructor(UnitStrayCat)
			}
		})
	}
}
