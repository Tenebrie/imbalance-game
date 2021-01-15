import store from '@/Vue/store'
import en from '@/Pixi/locales/en.json'
import ru from '@/Pixi/locales/ru.json'
import Language from '@shared/enums/Language'

class Localization {
	public getValueOrNull(id: string): string | null {
		let localizationJson: { [index: string]: string }
		const language = store.state.userPreferencesModule.userLanguage
		if (language === 'en') {
			localizationJson = en
		} else {
			localizationJson = ru
		}
		return localizationJson[id] || en[id] || null
	}

	public get(id: string): string {
		const value = this.getValueOrNull(id)
		return value === null ? id : value
	}

	public getOriginalOrNull(id: string): string {
		const localizationJson: { [index: string]: string } = en
		return localizationJson[id] || null
	}
}

export default new Localization()
export const supportedLanguages: Language[] = Object.values(Language) as Language[]
