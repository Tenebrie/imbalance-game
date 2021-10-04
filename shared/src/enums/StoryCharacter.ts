import { enumToArray } from '../Utils'

enum StoryCharacter {
	NARRATOR = 'narrator',
	NOT_NESSA = 'notNessa',
	UNKNOWN = 'unknown',

	ELSA = 'elsa',
	BODGE = 'bodge',
	NIRA = 'nira',
	PROTAGONIST = 'protagonist',
	NOT_MAYA = 'notMaya',
	TOP = 'top',
	DRESS = 'dress',
	HOODIE = 'hoodie',
	COAT = 'coat',
	T_SHIRT = 'tShirt',
	WEDDING_DRESS = 'weddingDress',
	SKIRT = 'skirt',
	DRYAD = 'dryad',
	MAID_DRESS = 'maidDress',
}

export const storyCharacterFromString = (value: string): StoryCharacter | null => {
	return enumToArray(StoryCharacter).find((char) => char.toLowerCase() === value.toLowerCase()) || null
}

export default StoryCharacter
