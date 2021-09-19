import EditorDeck from '@shared/models/EditorDeck'
import { createRandomEditorDeckId } from '@src/utils/Utils'

export default {
	getStartingDecks(): EditorDeck[] {
		const myFirstDeck = {
			id: createRandomEditorDeckId(),
			name: 'My First Deck',
			cards: [
				{ class: 'leaderMaximilian', count: 1 },
				{ class: 'heroTroviar', count: 1 },
				{ class: 'heroPozoga', count: 1 },
				{ class: 'heroRobert', count: 1 },
				{ class: 'heroAura', count: 1 },
				{ class: 'heroForksmanshipInstructor', count: 2 },
				{ class: 'heroLightOracle', count: 2 },
				{ class: 'unitUrbanTactician', count: 2 },
				{ class: 'heroCultistOfAreddon', count: 2 },
				{ class: 'unitBloodyTrebuchet', count: 2 },
				{ class: 'unitEagleEyeArcher', count: 3 },
				{ class: 'unitChargingKnight', count: 3 },
				{ class: 'unitYoungSquire', count: 3 },
				{ class: 'unitMasterSwordsmith', count: 3 },
				{ class: 'unitRavenMessenger', count: 3 },
				{ class: 'unitWoodenPalisade', count: 3 },
				{ class: 'unitArcheryTower', count: 3 },
			],
		}

		return [myFirstDeck]
	},
}
