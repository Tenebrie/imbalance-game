import Language from '@shared/enums/Language'
import Card from '@shared/models/Card'
import CardMessage from '@shared/models/network/card/CardMessage'

import en from '@/Pixi/locales/en.json'
import ru from '@/Pixi/locales/ru.json'
import store from '@/Vue/store'

const localizationIdRegex = /^[a-zA-Z0-9.]*$/

class Localization {
	public getCardName(card: Card | CardMessage): string {
		const language = store.state.userPreferencesModule.userLanguage
		return this.get(card.localization[language].name, 'key')
	}

	public getCardTitle(card: Card | CardMessage): string | null {
		const language = store.state.userPreferencesModule.userLanguage
		return this.get(card.localization[language].title, 'null')
	}

	public getCardFlavor(card: Card | CardMessage): string | null {
		const language = store.state.userPreferencesModule.userLanguage
		return this.get(card.localization[language].flavor, 'null')
	}

	public getCardListName(card: Card | CardMessage): string | null {
		const language = store.state.userPreferencesModule.userLanguage
		return this.get(card.localization[language].listName, 'null')
	}

	public getCardDescription(card: Card | CardMessage): string {
		const language = store.state.userPreferencesModule.userLanguage
		return this.get(card.localization[language].description, 'key')
	}

	private static getValueOrNull(id: string): string | null {
		if (!id.match(localizationIdRegex)) {
			return id
		}
		let localizationJson: { [index: string]: string }
		const language = store.state.userPreferencesModule.userLanguage
		if (language === 'en') {
			localizationJson = en
		} else {
			localizationJson = ru
		}
		// @ts-ignore
		return localizationJson[id] || en[id] || null
	}

	public get(id: string): string
	public get(id: string, errorBehaviour: 'key' | 'empty'): string
	public get(id: string, errorBehaviour: 'null'): string | null
	public get(id: string, errorBehaviour: 'key' | 'empty' | 'null' = 'key'): string | null {
		const value = Localization.getValueOrNull(id)
		if (value) {
			return value
		}
		if (errorBehaviour === 'key') {
			return id
		} else if (errorBehaviour === 'empty') {
			return ''
		} else if (errorBehaviour === 'null') {
			return null
		}
		return id
	}

	public getOriginal(id: string): string | null {
		const localizationJson: { [index: string]: string } = en
		return localizationJson[id] || null
	}
}

export default new Localization()
export const supportedLanguages: Language[] = Object.values(Language) as Language[]
