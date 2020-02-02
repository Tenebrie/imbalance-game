import en from '@/Pixi/locales/en.json'
import ru from '@/Pixi/locales/ru.json'
import Settings from '@/Pixi/Settings'

export default class Localization {
	public static getString(id: string): string {
		let localizationJson: {[ index: string]: string}
		const language = Settings.language
		if (language === 'en') {
			localizationJson = en
		} else {
			localizationJson = ru
		}

		return localizationJson[id] || en[id] || ''
	}
}
