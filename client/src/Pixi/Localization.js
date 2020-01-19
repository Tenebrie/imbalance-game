import en from '@/Pixi/locales/en.json';
import ru from '@/Pixi/locales/ru.json';
import Settings from '@/Pixi/Settings';
export default class Localization {
    static getString(id) {
        let localizationJson;
        const language = Settings.language;
        if (language === 'en') {
            localizationJson = en;
        }
        else {
            localizationJson = ru;
        }
        return localizationJson[id] || '';
    }
}
//# sourceMappingURL=Localization.js.map