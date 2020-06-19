import en from '@/Pixi/locales/en.json'
import ru from '@/Pixi/locales/ru.json'
import Settings from '@/Pixi/Settings'
import store from '@/Vue/store'

export const supportedLanguages = ['en', 'ru']

export default class Localization {
	public static get(id: string): string {
		let localizationJson: {[ index: string]: string}
		const language = store.state.userPreferencesModule.selectedLanguage
		if (language === 'en') {
			localizationJson = en
		} else {
			localizationJson = ru
		}

		return localizationJson[id] || en[id] || ''
	}
}
