import { enumToArray } from '../Utils'

enum StoryCharacter {
	NARRATOR = 'narrator',
	DRAGON_NARRATOR = 'dragonNarrator',
	NOT_NESSA = 'notNessa',
	UNKNOWN = '',

	ELSA = 'elsa',
	BODGE = 'bodge',
	NIRA = 'nira',
	PROTAGONIST = 'protagonist',

	QALEETA = 'qaleeta',
	ENCHANTED_DUMMY = 'enchantedDummy',
}

export const storyCharacterFromString = (value: string): StoryCharacter | null => {
	return enumToArray(StoryCharacter).find((char) => char.toLowerCase() === value.toLowerCase()) || null
}

export default StoryCharacter
