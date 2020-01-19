import axios from 'axios';
import * as PIXI from 'pixi.js';
export default class TextureAtlas {
    static async prepare() {
        return new Promise(async (resolve) => {
            if (TextureAtlas.texturesLoaded > 0) {
                resolve();
                return;
            }
            TextureAtlas.texturesLoaded = 0;
            TextureAtlas.textures = {};
            const components = [
                'components/bg-power',
                'components/bg-power-zoom',
                'components/bg-name',
                'components/bg-description',
                'components/bg-stats-left',
                'components/bg-stats-middle',
                'components/bg-stats-right',
                'components/bg-stats-right-zoom',
                'components/stat-attack-claw',
                'cards/cardBack'
            ];
            const response = await axios.get('/cards');
            const cardMessages = response.data;
            const cards = cardMessages.map(cardMessage => {
                const name = cardMessage.cardClass.substr(0, 1).toLowerCase() + cardMessage.cardClass.substr(1);
                return `cards/${name}`;
            });
            const texturesToLoad = components.concat(cards);
            console.log(texturesToLoad);
            TextureAtlas.texturesToLoad = texturesToLoad.length;
            texturesToLoad.forEach(fileName => {
                const texture = PIXI.Texture.from(`assets/${fileName}.png`);
                const onLoaded = () => {
                    TextureAtlas.texturesLoaded += 1;
                    TextureAtlas.textures[fileName.toLowerCase()] = texture;
                    if (TextureAtlas.texturesLoaded >= TextureAtlas.texturesToLoad) {
                        console.info('TextureAtlas initialized');
                        resolve();
                    }
                };
                texture.baseTexture.on('loaded', onLoaded);
                texture.baseTexture.on('error', onLoaded);
            });
        });
    }
    static isReady() {
        return TextureAtlas.texturesLoaded >= TextureAtlas.texturesToLoad;
    }
    static getTexture(path) {
        path = path.toLowerCase();
        if (!this.isReady()) {
            console.warn(`Accessing texture at '${path}' before TextureAtlas is ready!`);
        }
        const texture = this.textures[path];
        if (!texture) {
            console.warn(`No texture available at '${path}'`);
        }
        return this.textures[path];
    }
}
//# sourceMappingURL=TextureAtlas.js.map