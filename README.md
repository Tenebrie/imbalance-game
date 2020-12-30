# NotGwent

"*NotGwent*" (temporary name) is a work-in-progress open-source trading card game. See *Rules*
section in the game for more information about the ruleset.

## Try the game
You can play the current stable version of the game at https://app.tenebrie.com/. Automatically deployed
from the *Master* branch.

You can also test the latest version, deployed straight from the *Develop* branch (i.e. unstable builds),
at https://pure-chamber-21653.herokuapp.com/

Dev environment goes to sleep after long periods of inactivity, and may take up to 30 seconds to boot up again.

## Licensing
Please note that while the code is licensed under GPL v3.0, all the art assets
are property of their respective owners.

## Development
The development environment is dockerized, so you'll need to have a working Docker installation on your machine to
run the dev environment. It is tested in WSL2 and on Mac OS, but any valid installation should work fine.

Please keep in mind that `client/src`, `server/src` and `shared/src` folders are shared between the host machine and
the Docker containers. If the code fails to compile, check that the shared folders are mounted correctly (a common 
issue with WSL).

### Running the app
`$ docker-compose up`
or
`$ yarn docker:start`

After the build, you can access any of the apps:

- Client: http://localhost:8080
- Server: http://localhost:3000
- Database: [postgres://localhost:5432](postgres://localhost:5432)

See the [Making cards](#making-cards) section below for info about, well, adding custom cards.

### Linting
The code is equipped with ESLint and Prettier. Use `yarn lint` inside the
target project directory (client or server) to detect errors or `yarn lint-fix`
to automatically fix what is fixable (currently only in `server`).

If you're using an IDE, it should pick up all the linting rules automatically.

### Deploying to Heroku
All the necessary build steps are built into the root `package.json` file, so for deployment it's enough to push
the code to Heroku. Everything is automated after that point.

### Manual deployment
From the repository root run the following to download the dependencies and move the client files to the server
folder:

`$ yarn && yarn build`

To run the server:

`$ yarn start`

The server binds to a port specified by `PORT` environmental variable or defaults to `3000`. 

## Architecture
This is a standard web application, with the frontend written in *Vue.js* and *Pixi.js*, backend - *Express.js* with
*Node.js*, and the data is stored in the *Postgres* database.

All the relevant code uses *TypeScript*.

## <a name="making-cards"></a>Making cards
Adding custom cards is a relatively straight-forward process. While the stuff below may look intimidating, most of it
is optional, and you can start by just copying an existing card that's close to what you're working on.

However, to make a fully functional card from scratch, here are the required steps:

### Basic card definition
- Create a new class anywhere under `server/src/game/cards` directory. The exact folder doesn't matter.
  - This class should extend `ServerCard` class.
  - Make sure that the class name matches the file name, otherwise it will be ignored by the loader.
  - Please follow the naming convention:
    - Card class name should be in PascalCase;
    - Card class name should be prefixed:
    - `Leader` for Leader cards
    - `Hero` for Legendary units
    - `Unit` for Epic and Common units
    - `Spell` for Spells and Leader Powers
    - `Token` for token spells (i.e. the ones that are never played in the game)
- In the `super` call in the constructor, fill in the base parameters:
  - For **Units**:
    ```
    type: CardType.UNIT
    color: CardColor.GOLDEN | CardColor.SILVER | CardColor.BRONZE
    faction: CardFaction.HUMAN | CardFaction.ARCANE | CardFaction.WILD | CardFaction.NEUTRAL 
    expansionSet: ExpansionSet.BASE
    stats: {
      power: number
      armor: number (Optional, defaults to 0)
    }
    ```

  - For **Spells**:
    ```
    type: CardType.SPELL
    color: CardColor.GOLDEN | CardColor.SILVER | CardColor.BRONZE | CardColor.TOKEN
    faction: CardFaction.HUMAN | CardFaction.ARCANE | CardFaction.WILD | CardFaction.NEUTRAL
    expansionSet: ExpansionSet.BASE
    stats: {
      cost: number
    }
    ```
    
  - For **Leaders**:
    ```
    type: CardType.UNIT
    color: CardColor.LEADER
    faction: CardFaction.HUMAN | CardFaction.ARCANE | CardFaction.WILD | CardFaction.NEUTRAL
    expansionSet: ExpansionSet.BASE
    ```
    
  - Additionally, for **All cards** you can use those optional parameters:
    - `tribes: CardTribe | CardTribe[]`
      - Card tribes. See `shared/src/enums/CardTribe` for full list.
      - Default: `[]`.
    - `features: CardFeature | CardFeature[]`
      - Card features. See `shared/src/enums/CardFeature` for full list.
      - Default: `[]`.
    - `relatedCards: CardConstructor | CardConstructor[]`
      - List of related cards. Use only for directly related tokens *that never change*.
      - If related cards include some condition (like only cards of a specific tribe), see
        [Related cards](#related-cards) section.
      - Default: `[]`.
    - `sortPriority: number`
      - Sorting priority. Comes after card color, type and power. Lower value means higher priority.
      - Default: `99`.
    - `isExperimental: boolean`
      - Marks the card as experimental.
      - Default: `false`.
    - `generatedArtworkMagicString: string`
      - Alters the generated card artwork. No effect if the proper artwork is provided.
      - Default: `''`.
    - `deckAddedCards: CardConstructor[]`
      - List of cards added to the deck (units or spells) when the game starts.
      - Default: `[]`.
    - `hiddenFromLibrary: boolean`
      - Card won't appear in the library, and it won't be allowed in the deck.
      - Default: `false`.
    
### Adding card text
- Add card text to `client/src/Pixi/locales/en.json`
  - By default, any card requires the following entries:
    - `card.cardClass.name`
    - `card.cardClass.description`
  - Leaders and Legendary units should also have:
    - `card.cardClass.title`
  - Any card may optionally also have:
    - `card.cardClass.flavor`
  - For example, if the card class name is `HeroRobert`, then this card may have the following entries:
      - ```
        "card.heroRobert.name": "Robert",
        "card.heroRobert.title": "Building Instructor",
        "card.heroRobert.description": "*Deploy:*\n*Summon* a Building and *Create* a copy of it with no armor.",
        "card.heroRobert.flavor": "- \"And that's how you build it. Easy, right? Now, repeat after me.\"",
        ```
  - See [Rich text](#rich-text) section below for more information on the syntax
  - Conventions:
    - The keywords (Deploy, Turn start, Turn end, Infuse, Dispel etc.) are always highlighted.
    - Unless there is a good reason not to, put a newline between the trigger keyword and the description.
    - Separate different effects of the card with paragraphs (`<p>`).
    - The terms like Power, Armor, Mana; and also other card and buff names are always capitalized.
- For any keywords you use in the description, add a corresponding keyword feature (such as
  `CardFeature.FEATURE_DEPLOY`) to the card definition to show when the card is inspected. 

### Additional properties
In addition to the properties described above, you may need some extra functionality.
All the methods mentioned below will need to be invoked from the card constructor.

#### Exporting variables
Instances of rich text attached to a card may utilize dynamic variables. A basic usage for **static values** looks
as follows:
```
this.dynamicTextVariables = {
  attack: 10,
  myVar: 'var',
}
```

A common practice is to also declare any variables on the top of the class file, and then reference that both from
the effect code, and the exported variables.
```
this.dynamicTextVariables = {
  attack: this.attack,
}
```

**Important note:** Exports like this are **static**. That means they are only evaluated at the moment of card
creation. For values that may change during the game, use getter functions:
```
this.dynamicTextVariables = {
  attack: () => this.attack,
  otherValue: () => this.getOtherValue(),
}
```

Card variables are evaluated after every player or server action.

#### <a name="related-cards"></a>Related cards
To add related cards that satisfy a certain condition, use `addRelatedCards` chaining method.

For example, if a card is related to all Common Peasant cards from the Human faction, the call would look like this:

```
this.addRelatedCards()
    .require((card) => card.color === CardColor.BRONZE)
    .require((card) => card.faction === CardFaction.HUMAN)
    .require((card) => card.tribes.includes(CardTribe.PEASANT))
```

While `require` call may be used for arbitrary conditions, you may also use helper methods for color,
tribe and faction:

```
this.addRelatedCards()
    .requireColor(CardColor.BRONZE)
    .requireTribe(CardTribe.PEASANT)
    .requireFaction(CardFaction.HUMAN)
```

### Adding card effects
To be added later. For now, see the following methods in `ServerCard`: 

- `createPlayTargets`
- `createUnitOrderTargets`
- `createDeployEffectTargets`
  

- `createCallback`
- `createEffect`
- `createHook`
- `createSelector`


### <a name="rich-text"></a>Rich text
Rich text is supported in the following instances of text:
- Card name
- Card description
- Targeting label

The syntax for the rich text is a mix between Markdown and XML. See examples:
- `This *text* is *highlighted*`
  - Will render "This **text** is **highlighted**"
  

- `This _text_ is in _italics_`
  - Will render "This _text_ is in _italics_"
  

- `This card's attack value is {attack}`
  - Dynamically renders values exported from the card definition
  - If `attack` = 10, then will render "This card's attack value is **10**"
  - Note: the dynamic value is highlighted by default. If not desired, wrap it in the highlight, like `*{attack}*`.
  

- `This text is <if myValue>conditional</if>`
  - Dynamically renders based on the values exported from the card definition
  - Will render "This text is" if `myValue` is falsy
  - Will render "This text is conditional" if `myValue` is truthy
  

- `This text is <ifn myValue>conditional</ifn>`
  - Inverse of `<if></if>`
  - You may also use `</if>` as the closing tag
  

- `This text is <i>informational</i>`
  - Renders the text inside the `<i></i>` tags as italics and dark gray
  

- Additionally, you may use standard newlines and `<p></p>` tag for paragraphs.
