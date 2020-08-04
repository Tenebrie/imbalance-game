import store from '@/Vue/store'
import en from '@/Pixi/locales/en.json'
import ru from '@/Pixi/locales/ru.json'

class Localization {
	public get(id: string): string {
		let localizationJson: {[ index: string]: string}
		const language = store.state.userPreferencesModule.userLanguage
		if (language === 'en') {
			localizationJson = en
		} else {
			localizationJson = ru
		}

		return localizationJson[id] || en[id] || id
	}
}

export default new Localization()
export const supportedLanguages = ['en', 'ru']
