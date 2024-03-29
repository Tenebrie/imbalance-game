import Language from '@shared/enums/Language'
import Buff from '@shared/models/Buff'
import Card from '@shared/models/Card'
import BuffMessage from '@shared/models/network/buffs/BuffMessage'
import CardMessage from '@shared/models/network/card/CardMessage'

import en from '@/Pixi/locales/en.json'
import ru from '@/Pixi/locales/ru.json'
import { mergeCardTribes } from '@/utils/Utils'
import store from '@/Vue/store'

const localizationIdRegex = /^[a-zA-Z0-9.]*$/

class Localization {
	public getCardName(card: Card | CardMessage): string {
		const language = store.state.userPreferencesModule.userLanguage
		return this.get(card.localization[language].name, 'key')
	}

	public getCardTitle(card: Card | CardMessage): string | null {
		const language = store.state.userPreferencesModule.userLanguage
		const titleOrTitleStringId = card.localization[language].title
		if (!titleOrTitleStringId.match(localizationIdRegex)) {
			return titleOrTitleStringId
		}
		return this.get(titleOrTitleStringId, 'null')
	}

	public getCardTribes(card: Card | CardMessage): string[] {
		const tribes = mergeCardTribes(card.baseTribes, card.buffs.buffs)
		return tribes.map((tribe) => this.get(`card.tribe.${tribe}`, 'empty'))
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

	public getBuffName(buff: Buff | BuffMessage): string {
		const language = store.state.userPreferencesModule.userLanguage
		return this.get(buff.localization[language].name, 'key')
	}

	public getBuffDescription(buff: Buff | BuffMessage): string {
		const language = store.state.userPreferencesModule.userLanguage
		return this.get(buff.localization[language].description, 'key')
	}

	private static getValueOrNull(id: string): string | null {
		if (!id.match(localizationIdRegex)) {
			return null
		}
		let localizationJson: { [index: string]: string }
		const defaultLocalizationJson: { [index: string]: string } = en
		const language = store.state.userPreferencesModule.userLanguage
		if (language === 'en') {
			localizationJson = en
		} else {
			localizationJson = ru
		}
		return localizationJson[id] || defaultLocalizationJson[id] || null
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
