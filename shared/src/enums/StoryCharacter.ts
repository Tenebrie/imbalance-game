import { enumToArray } from '../Utils'

enum StoryCharacter {
	NARRATOR = 'narrator',
	NOT_NESSA = 'notNessa',
	UNKNOWN = 'unknown',

	ELSA = 'elsa',
	BODGE = 'bodge',
	NIRA = 'nira',
	PROTAGONIST = 'protagonist',
}

export const storyCharacterFromString = (value: string): StoryCharacter | null => {
	return enumToArray(StoryCharacter).find((char) => char.toLowerCase() === value.toLowerCase()) || null
}

export default StoryCharacter
