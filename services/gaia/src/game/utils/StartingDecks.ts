import EditorDeck from '@shared/models/EditorDeck'
import { createRandomEditorDeckId, getClassFromConstructor } from '@src/utils/Utils'

import GwentArchespore from '../cards/14-gwent/monster/bronze/GwentArchespore'
import GwentDrowner from '../cards/14-gwent/monster/bronze/GwentDrowner'
import GwentGhoul from '../cards/14-gwent/monster/bronze/GwentGhoul'
import GwentNekker from '../cards/14-gwent/monster/bronze/GwentNekker'
import GwentRotfiend from '../cards/14-gwent/monster/bronze/GwentRotfiend'
import GwentBrewessRitual from '../cards/14-gwent/monster/golden/GwentBrewessRitual'
import GwentEredin from '../cards/14-gwent/monster/leader/GwentEredin'
import GwentAddaStriga from '../cards/14-gwent/monster/silver/GwentAddaStriga'
import GwentMaerolorn from '../cards/14-gwent/monster/silver/GwentMaerolorn'
import GwentSheTrollOfVergen from '../cards/14-gwent/monster/silver/GwentSheTrollOfVergen'
import GwentToadPrince from '../cards/14-gwent/monster/silver/GwentToadPrince'
import GwentGeraltIgni from '../cards/14-gwent/neutral/golden/GwentGeraltIgni'
import GwentGeraltOfRivia from '../cards/14-gwent/neutral/golden/GwentGeraltOfRivia'
import GwentRoyalDecree from '../cards/14-gwent/neutral/golden/GwentRoyalDecree'
import GwentOlgierdVonEverec from '../cards/14-gwent/neutral/silver/GwentOlgierdVonEverec'
import GwentRoach from '../cards/14-gwent/neutral/silver/GwentRoach'

export default {
	getStartingDecks(): EditorDeck[] {
		const myFirstDeck = {
			id: createRandomEditorDeckId(),
			name: `Consuming Monsters`,
			cards: [
				{ ref: GwentEredin, count: 1 },
				{ ref: GwentGeraltIgni, count: 1 },
				{ ref: GwentGeraltOfRivia, count: 1 },
				{ ref: GwentBrewessRitual, count: 1 },
				{ ref: GwentRoyalDecree, count: 1 },
				{ ref: GwentOlgierdVonEverec, count: 1 },
				{ ref: GwentAddaStriga, count: 1 },
				{ ref: GwentMaerolorn, count: 1 },
				{ ref: GwentRoach, count: 1 },
				{ ref: GwentToadPrince, count: 1 },
				{ ref: GwentSheTrollOfVergen, count: 1 },
				{ ref: GwentNekker, count: 3 },
				{ ref: GwentDrowner, count: 3 },
				{ ref: GwentGhoul, count: 3 },
				{ ref: GwentRotfiend, count: 3 },
				{ ref: GwentArchespore, count: 3 },
			],
		}

		const transformedDecks = [myFirstDeck].map((deck) => ({
			...deck,
			cards: deck.cards.map((card) => ({
				class: getClassFromConstructor(card.ref),
				count: card.count,
			})),
		}))

		return transformedDecks
	},
}
