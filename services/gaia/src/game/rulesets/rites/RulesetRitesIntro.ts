import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import { RitesPlayerCharacter } from '@shared/models/progression/RitesProgressionState'
import GameVictoryCondition from '@src/enums/GameVictoryCondition'
import UnitRitesFlameArcana from '@src/game/cards/12-rites/cards/UnitRitesFlameArcana'
import UnitRitesMajorFlameArcana from '@src/game/cards/12-rites/cards/UnitRitesMajorFlameArcana'
import UnitRitesPoisonArcana from '@src/game/cards/12-rites/cards/UnitRitesPoisonArcana'
import UnitRitesWindArcana from '@src/game/cards/12-rites/cards/UnitRitesWindArcana'
import { RitesItemTravelingGarb } from '@src/game/cards/12-rites/items/armor/RitesArmor_Basic'
import { CardConstructor } from '@src/game/libraries/CardLibrary'
import ServerGame from '@src/game/models/ServerGame'
import { capitalize, getClassFromConstructor, plurify } from '@src/utils/Utils'

import BaseRulesetRitesEncounter from './service/BaseRulesetRitesEncounter'

export default class RulesetRitesIntro extends BaseRulesetRitesEncounter {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.RITES,
			constants: {
				SKIP_MULLIGAN: true,
				ROUND_WINS_REQUIRED: 1,
			},
		})

		let character: RitesPlayerCharacter = {
			body: 'humanoid',
			heritage: 'mundane',
			appearance: 'feminine',
			personality: {
				brave: 0,
				charming: 0,
				honorable: 0,
				nihilistic: 0,
			},
		}

		const getCharacterCalledName = (character: RitesPlayerCharacter): string => {
			if (character.body === 'humanoid' && character.heritage === 'mundane' && character.appearance === 'masculine') return 'young man'
			else if (character.body === 'avian' && character.appearance === 'masculine') return 'young bird'
			else if (character.body === 'avian') return 'little bird'
			else if (character.body === 'equine' && character.appearance === 'masculine') return 'little colt'
			else if (character.body === 'equine' && character.heritage === 'nature' && character.appearance === 'feminine') return 'little dryad'
			else if (character.body === 'equine') return 'little pony'
			return 'young one'
		}

		this.createCallback(GameEventType.GAME_SETUP)
			.startDialog(() => {
				const isFirstPlay = game.progression.rites.state.meta.runCount === 0
				const oldCharacter = game.progression.rites.state.meta.character
				const oldCharacterDescription = `${capitalize(oldCharacter.appearance)} ${oldCharacter.body} with ${plurify(
					'a',
					oldCharacter.heritage
				)} heritage`

				return `
					--> ${isFirstPlay ? 'FullIntro' : 'RewatchingIntro'}

					RewatchingIntro:
						> It seems you have already seen the introduction.
							> We can skip it and go over your heritage real quick to save some time.
							> Or I can just tell you the whole story again. I don't mind.
						@ Full introduction.
							--> FullIntro
						@ Quick character creation.
							--> QuickCharacterCreation
						@ Keep previous character (${oldCharacterDescription}).
							--> RestoreOldCharacter
							--> Depart


					FullIntro:
						> Far in the north, beyond the reach of any human struggles,
							> stands a village, long forgotten by time.
						> The people of this village are different from one may expect.
							> Both in their customs, and in their looks.
						> Some would look completely normal to a human eye. The others, however,
							> would inspire fear or curiosity.
						> The hunters, for example, are often big, bulky men with stag antlers
							> displaying their age and status.
						> They have no need to sneak or stalk their prey. Their spears pierce
							> the air and find their mark long before it even realizes something
							> is amiss.
						> The weavers are represented by smaller, a lot more agile creatures.
						> Pixies, a human could call them. Barely half the size of a stag,
							> they use their fluttering wings to navigate their tiny workshops
							> and weave truly beautiful fabrics.
						> If you enter the healers' hut, you'll likely find daughters of the forest
							> ready to ease your pain. The dryads themselves are all different
							> from one another, and their ancestry is often apparent even to an untrained eye.
						> Some of them have close-to-human shape, just their skin taking a green or
							> orange hue depending on the season. Others are trotting about on their four legs
							> and waving their deer tails around.
						> The human empires of the south would surely be interested in the inhabitants of this
							> village. Would it be fear and extermination; or the desire to weaponize the
							> unique skills of the northkin is difficult to say.
						> But it's a lot safer to stay hidden from the world.
						> You are becoming an adult soon. A true member of the northkin, a worthy addition
							> to the closely-knit family that keeps the village afloat.
							> But that means the most difficult trial of your life is approaching.
						@ I am excited about it!
							> Of course you are.
						@ I am worried about it.
							> No wonder you are.
						@ I know I must do it.
							> Yes. Everybody must.
						@ I have gotten used to thinking about it.
							> You have been preparing for it a very long time, after all.

						> The Rites. A pilgrimage into the unknown, into the cold snowy wasteland that lies
							> beyond the safe walls of the village. A true testament of strength of those that
							> have returned.
						> Not only is this an important test of one's mettle, but it's also a crucial tool
							> to ensure the survival of the village. Not everything can be produced or foraged,
							> and so it falls to the initiates to bring the rarities back from their journey.
						> The journey that you have been unwillingly dreaming about for the past few days.
						> You are slowly drifting back into reality and start hearing the ravens outside.
							> It must be night already.
						@ I open my eyes and wake up.
						@ I sleep a while longer.
							> If that's what you wish.
							> You hear the village waking up outside.
							> The fluttering of wings signifies that it's feeding time for the birds, who
								> all gather at the ice fountain in the center waiting for their daily rations.
							> The hunters are getting ready too, it seems. You hear the metal tips of their spears
								> clanking and rattling in the quivers. You also notice some feminine laughter from
								> the same direction. It seems one of the women is also joining the hunt tonight.
							> It's quite difficult to keep sleeping with all that noise outside.
							@ I open my eyes and wake up this time.
						
						> Your room is covered by soft moonlight that took a teal hue.
							> It's time to start the night, but first, you need to get yourself dressed.
						> Your selection of outfits is not exactly spectacular, but some choice you do have.
							> What are you going to wear?
						@ Something manly, to show my muscles and strength [Masculine appearance]
							> There is no shortage of simple clothing that highlights your body and shows off some body hair
								> all while being pretty toasty.
							> It's not a long process to get it on, and so you're ready to start your day in seconds.
							--> setAppearanceMasculine
						@ Something like a dress, because we don't have stereotypes around here [Masculine appearance]
							> You do have a few feminine things stored in your wardrobe. You pick something that fits the mood
								> and keeps you warm, and you are off to start your day.
							--> setAppearanceMasculine
						@ Something feminine, to show my grace and elegance [Feminine appearance]
							> You do spend quite a moment trying to find a good match. This dress? No, this skirt...
								> Oh, maybe that? No, nothing seems to fit together well.
							> It took you a good chunk of an hour, but eventually you're all dressed up and ready to
								> start your day looking quite lovely and warm at the same time.
							--> setAppearanceFeminine
						@ Something that a guy could wear, because why not [Feminine appearance]
							> You don't seem to think too much about your outfit of the day, and you grab something
								> warm, comfortable and simple to clean. You're ready to start off your day in seconds.
							--> setAppearanceFeminine
						@ Frankly, my choice of outfits does not concern anybody but me. [Alright, no genders]
							> You dig into your chest looking for something you like today, and, sure enough, you find
								> it eventually. It's now time to start your day.
							--> setAppearanceAmbiguous
						
						> What are you planning to do before your duties call?
						@ I am going to practice my spellcasting. [Humanoid character]
							--> setBodyHumanoid
							> You go outside, stretch a little, and make your way towards the training area.
							> It's still quite empty, but you see a few other younglings already practicing with swords, spears and arcanas.
								> Magic has always been your strong suit, but your weapons have seen a fair share of training as well.
								> Today, however, is supposed to be the arcana day, so you're about to start some fireworks.
							> You stand in front of a free dummy, shift your weight into the combat stance and concentrate.
								> You think about the lessons your teacher gave you. It was many years ago when you started to train
								> with her, but you still remember the first rule.
							> "Always use everything you have at your disposal", she said. "Everybody here has something that sets them apart. And you..."

							@ "... you've got your will, wits and determination". [Mundane heritage]
								--> setHeritageMundane
								> You unleashed an unrelenting volley of attacks at your imaginary target. Every one barely able to deal any damage, but
									> even an enchanted target dummy couldn't survive the assault for long.
									> Ripped out from the ground, it smashed into the wall behind it with a loud bang, symbolizing your victory.
								> Yes, you do not have any special power than many other northkin possess. You don't have wings, you can't summon a blazing
									> inferno with your bare hands, yet you've been able to train and master the simple skills you have. You can persevere.
									> You always have.
								> The enchantment of the training field is starting to take effect, and the dummy in front of you is slowly being pulled back
									> into its' original place. The practice is not a single fight. It's a multitude of them.
								> And so, the practice resumes...

							@ "... you control the raw power of this world". [Arcane heritage]
								--> setHeritageArcane
								> A short burst of pure magical energy has left your hand, and the poor target dummy stood no chance.
									> The wooden splinters have pierced the wall behind it, leaving blazing fiery holes, and the vaporized
									> snow transformed into light mist in the air.
								> There is something about the arcane mark you bear.
									> Something truly powerful.
								> The enchantment of the training field is starting to take effect, and the dummy in front of you is starting to assemble
									> itself back together. Not before long it's back to its' usual self, some scorch mark notwithstanding.
								> And so, the practice resumes...

							@ "... you've got the Forest on your side". [Nature heritage]
								--> setHeritageNature
								> The land itself has always been your ally. A quiet whisper, a flick of the fist, and your target is being ripped apart by
									> ancient vines that slept under the snow for years. They snap, they catch, they smash, until the dummy is nothing but
									> a pile of splinters.
								> Your power is not about you being strong. It's about relying on the power of others. The power of the land, the earth and the Forest.
									> You may be far from the greenery so far north, but that doesn't mean you are alone.
									> Quite the opposite, in fact. This is your element of surprise.
								> The enchantment of the training field is starting to take effect, and the dummy in front of you is starting to assemble
									> itself back together. Not before long it's back to its' usual self, even though its' arm is missing.
								> Well, it was missing, until you kindly asked your helpers to return it back to you.
								> And as soon as your target was ready for the fight again, all you had to do was to whisper once again...
						
						
						@ I am going for my morning trot. [Equine character]
							--> setBodyEquine
							> You know a good track that leads on a scenic route around the village. It's a common and well guarded route, with many northkin using it
								> for their exercise, training or relaxation.
							> You give every one of your four legs a good stretch, give yourself a few energizing slaps on the sides are rush forward, leaving a cloud
								> of dust where you just stood.

							@ It's the speed that matters. The speed and endurance are my strong points. [Mundane heritage]
								--> setHeritageMundane
								> And so, you run. You run almost as fast as you never ran before, taking over the other travelers.
									> You reach the end of the track in an incredible amount of time, just to turn around and run back again.
								> You barely feel this in your body, and you just keep running until it tells you to stop. You need to release
									> all that energy, all that... anger you feel at the world for keeping locked here. For making you wait in agony
									> until the elders allow you to finally leave the village and pass the Rites.
								> Your hooves leave a cloud of snowy dust behind you, but it's so normal, so mundane to you. You need something new
									> in your life, something exciting, something different. You want to prove yourself, yet you believe that you only
									> have a single chance to do so.

							@ I may not be as fast as some, but I have my magic to compensate. [Arcane heritage]
								--> setHeritageArcane
								> You feel your body change, filling with pure magic. You can see your own fiery glow for a moment before you disappear just to hop
									> out a lot further along down the track. You turn around, and you notice a glimpse of the blazing portal you left behind. It fades away
									> in a second, but it leaves a smile on your face.
								> Of course, teleportation is not the only thing you're good at. It's just the unique thing that you seem to enjoy more than others.
								> You continue moving along the track. Sometimes moving your hooves over lazily, sometimes jumping over long distances when you feel like it.
								> It does drain you, it's true, but what else is there to spend that energy on? Nobody can give you a good fight anymore.
									> Fighting an opponent who can appear behind your back at any moment is difficult even for the experienced hunters,
									> and they have better things to do, rather than to entertains younglings.
								> And that annoys you somewhat. You want to get better, you want to get stronger, but you have nothing left to do other than to
									> wait until you are allowed to leave for the Rites.
								> And that moment can't come too soon.

							@ I have nowhere to rush really, so I gently hop over to my destination. [Nature heritage]
								--> setHeritageNature
								> The rare outsiders that do visit the village often wonder the most about the way your kind has found their way here.
									> Half-human, and half-deer. A creature of the deep lush forests, forced to live among the snow and cold far north.
								> You are used to the snow, of course, but you know deep inside that you want to see your homeland.
									> The stories paint it as an incredibly beautiful place, and so full of all sorts of flowers and critters.
								> You almost feel the pull somewhere far, far away, as if your heart belongs there, and you were born in a wrong place.
								> But, there isn't much you can do now except dream while gently hopping along the track.
									> Maybe, that will be the destination for your Rites.
									> Or maybe, it's nothing but a childish dream that should be forgotten?

							> You keep your thoughts to yourself and admire the area. You have been here a thousand times, yet the moonlit village
								> never ceases to amaze. All the roads and houses gently glimmer with magical lights that do their best to imitate warm fire.
								> And aside from that, there is nothing but the white wasteland as far as the eye can see.
							> It's beautiful in its' own right.
								> And thankfully, you still have time to admire it before you return...

						@ I am going to stretch my wings. [Avian character]
							--> setBodyAvian
							> And so, you soar into the skies right after leaving your humble nest.
								> The feeling of the wind lightly washing over your wings will never get old, and you're not the only one to think that.
							> You see other birds in the sky - both the northkin, and common ravens you keep as pets and scouts, and they enjoy the nice
								> weather that blessed the village this night.
							> Yet you can't help but feel that you want to do something interesting with your flight today.
								> What could it be?

							@ I train figure flying, doing hoops and other tricks. [Mundane heritage]
								--> setHeritageMundane
								> It's not like you can do much more than that, really.
									> You look at your brethren, who all seem to be so much better than you at something.
								> Some are great when it comes to controlling the elements; others can stay underwater for
									> what seems to be an eternity. You? You are just... average, as far as feathered flying
									> people go.
								> You are proud, however, that you are better than them at the simple things. Nobody can do the
									> flying tricks as well as you can. Nobody can feel the coming weather as well as you can.
									> And nobody can... actually, that seems to be about it. But there are definitely more things.
								> Definitely.

							@ I light the sky up in flames for everyone in the village to see. [Arcane heritage]
								--> setHeritageArcane
								> You have always had it well with fire, so it didn't take you long to set your own feathers ablaze.
									> It didn't hurt, of course. In fact, the fire barely hurt you at all, but you still needed to be careful.
									> Keeping steady in the air while maintaining concentration for the magic was still a bit of a challenge.
								> After you made sure you are very well visible from the ground, you started doing all sorts of tricks and
									> maneuvers, almost writing something with your flaming body in the air.
									> It wasn't the first time you've entertained yourself like that, but it may be the last.
								> The Rites are coming soon, and nobody can tell you what will happen during your pilgrimage.
									> You may never come back to the village, or you may come back as someone completely different.

							@ I dive into the nearby hot lake. [Nature heritage]
								--> setHeritageNature
								> What would happen when a creature of the sky meets a denizen of the deep? In short, you happen.
									> You feel equally comfortable flying and swimming, and your feathers don't seem to get wet at all.
								> You feel the warm embrace of the lake as you dive in and relax for a moment, allowing yourself to sink deeper and deeper.
									> Even other nightkin wonder sometimes how you can stay without air for so long. And you don't really know it yourself.
									> It's just something you're naturally good at, it seems.
								> You hit the bottom with your back and remembering that it's, in fact, covered by less-than-pleasant algae, you quickly
									> start swimming back to the surface.
								> There is one thing you're not so good at though. It's trying to take off back into the air from the lake.
							
							> Of course, your wings meant you are never truly bound to the village, but you never ventured far into the wasteland.
								> There was just no need for you to do so, and any far away journey means you would have to fly all the way back as well.
							> You have scouted the nearby area quite well in preparation for your Rites, but you're still not sure where you'll go on that
								> fateful day. South, maybe, towards the empires of humanity? Or even further north, to find out if there is anything other
								> than endless snow waiting for you?
							> Thankfully, you still have time to think about it. But you'll keep thinking until the very last moment, it seems...

						--> RitesBegin
			`
			})
			.actionChapter('setAppearanceMasculine', () => (character.appearance = 'masculine'))
			.actionChapter('setAppearanceFeminine', () => (character.appearance = 'feminine'))
			.actionChapter('setAppearanceAmbiguous', () => (character.appearance = 'ambigous'))
			.actionChapter('setBodyHumanoid', () => (character.body = 'humanoid'))
			.actionChapter('setBodyEquine', () => (character.body = 'equine'))
			.actionChapter('setBodyAvian', () => (character.body = 'avian'))
			.actionChapter('setHeritageMundane', () => (character.heritage = 'mundane'))
			.actionChapter('setHeritageArcane', () => (character.heritage = 'arcane'))
			.actionChapter('setHeritageNature', () => (character.heritage = 'nature'))
			.chapter(
				'QuickCharacterCreation',
				() => `
				> Alright. What sort of clothes do you wear?
				@ Exclusively shorts and pants [Masculine character]
					--> setAppearanceMasculine
				@ Exclusively skirts and dresses [Feminine character]
					--> setAppearanceFeminine
				@ Still none of your business. [Ambiguous character]
					--> setAppearanceAmbiguous
				
				> What do you prefer? Legs, hooves or wings?
				@ I prefer to stay grounded. [Humanoid character]
					--> setBodyHumanoid
				@ Two legs are not enough. [Equine character]
					--> setBodyEquine
				@ Wings all the way up. [Avian character]
					--> setBodyAvian

				> And where are you from?
				@ Just your regular human(ish) village. [Mundane heritage]
					--> setHeritageMundane
				@ From the fiery void itself! [Arcane heritage]
					--> setHeritageArcane
				@ From a sacred grove deep in the forest. [Nature heritage]
					--> setHeritageNature

				--> FinishQuickCharacterCreation
			`
			)
			.chapter('FinishQuickCharacterCreation', () => {
				const summary = `${plurify('a', character.appearance)} ${character.body} of ${plurify('a', character.heritage)} heritage`
				return `
					> Alright, so you seem to be ${summary}.
						> Is that about right? Assuming, of course, I haven't added a proper race descriptions yet. Those are coming later.
					@ Yes, continue.
						--> Depart
					@ No, restart
						--> QuickCharacterCreation
			`
			})
			.chapter(
				'RitesBegin',
				() => `
				> ...
				> Very soon, that fateful day arrives.
				> The day when your Rites will begin.
				> You are stood at the city gates, donning your best travel attire and with all your supplies in a magic bag at your belt.
					> In front of you stands Qaleeta, the village elder. The one true authority in this place, your mentor, and your mother.

				Qaleeta:
				> Step forward, ${getCharacterCalledName(character)}.
				Unknown:
				> The village elder looks at you expectantly.
				@ Take a step forward.

				Qaleeta:
				> I know it's a big day for you. Everybody here, every one of the northkin have been through the pilgrimage, and we have no doubt
					> that you will succeed. However, the last thing we want to happen is for you to lose your life, so I have a gift for you.
				> Please, take it.
				@ Take it.
				Unknown:
				> You got "A Peculiar Amulet"!

				Qaleeta:
				> Nobody has figured out a good name for it over the years, but it will keep you safe. If you even run into serious trouble,
					> it will save you and return you to a safe place.
				> But be warned. It will only trigger when your life is in real danger, and the return will not be pleasant. Try not to use it
					> if you have any other options.

				Unknown:
				> She smiled at you softly.

				Qaleeta:
				> And now, as a formality, let me remind you your ultimate objective on your journey.
				> In order to prove yourself as a true member of our community, you must locale and return to us a Curiosity of your choice.
					> A Curiosity must be important for the village in some capacity, and it's your task to understand what we will find useful.
					> Would it be a magical item, a scientific advancement, or a living being, you must decide it yourself.
				> And I will judge whether or not the Curiosity you find matches the criteria of the Rites.
				> Any questions, ${getCharacterCalledName(character)}?
				--> Questions
			`
			)
			.chapter(
				'Questions',
				() => `
				Qaleeta:
				> She looks at you with a smile.
				@ May I return here before I find the Curiosity?
					Qaleeta:
					> You may not. You have all the knowledge and training you will need, and I believe that you will succeed.
						> If you return empty-handed still...
					Unknown:
					> She sighs.
					Qaleeta:
					> I will not be able to keep you behind the gates. But this is a mark of shame that will never be washed away.
						> So please, be successful. I believe in you.
					--> Questions

				@ How do I know that I have found the Curiosity?
					Qaleeta:
					> Like I said, you must figure it out on your own. It's your journey. Your pilgrimage. Your Rites.
					> But try not to overthink about it too much. If you doubt that something is a good Curiosity,
						> then it's not a good one, and you need to keep searching.
					> It may take a while. Sometimes it takes years, but the journey itself is just as important as
						> the result you find!
					Unknown:
					> She raises a finger in the air.

					Qaleeta:
					> You will get wiser, stronger, better. You will learn so many things you can never learn here. You will understand
						> the purpose of the Rites while you do it. This is what always happens.
					> If it all seems very arbitrary and cruel, I understand. I felt the same way. But then I brought us the first flock of ravens,
						> and look at them now! They help us, we keep them as pets, and they even keep the rodents away!
					> Not only that, but I've learned the importance of the community, visited the human kingdoms in the South, and even learned
						> their language.
					> I believe in you. You can do it. You must.
					--> Questions

				@ I don't have any questions. I am ready to depart.
					Qaleeta:
					> In this case, I wish you the best of luck, ${getCharacterCalledName(character)}.
						> May the ancient winds lead you to your destiny.
					@ Thank you, Qaleeta.
					@ Thank you, mother.
					@ [Nod and leave]
					@ [Stay silent]
					Unknown:
					> And so, your journey begins.
					--> Depart
		`
			)
			.actionChapter('RestoreOldCharacter', () => {
				const oldCharacter = game.progression.rites.state.meta.character
				character = oldCharacter
			})
			.actionChapter('Depart', () => {
				const player = game.getHumanGroup().players[0].player
				const deck: { card: CardConstructor; count: number }[] = []
				const items: CardConstructor[] = []

				/**
				 * Minimal deck:
				 * - Wind Arcana x1
				 * - Flame Arcana x3
				 */

				deck.push(
					{
						card: UnitRitesWindArcana,
						count: 1,
					},
					{
						card: UnitRitesFlameArcana,
						count: 3,
					}
				)

				items.push(RitesItemTravelingGarb)

				/**
				 * Racial units:
				 * - Mundane human - Wind Arcana x2
				 * - Flame-marked human - Major Flame Arcana x1
				 * - Humanoid dryad - Poison Arcana x2
				 *
				 * - Centaur - Wind Arcana x1
				 * - Flame centaur - Flame Arcana x2
				 * - Deer-dryad - Poison Arcana x1
				 *
				 * - Harpy - Wind Arcana x1
				 * - Phoenix - Flame Arcana x2
				 * - Merbird - Poison Arcana x1
				 */

				if (character.heritage === 'mundane') {
					deck.push({
						card: UnitRitesWindArcana,
						count: character.body === 'humanoid' ? 2 : 1,
					})
				} else if (character.heritage === 'arcane') {
					deck.push({
						card: character.body === 'humanoid' ? UnitRitesMajorFlameArcana : UnitRitesFlameArcana,
						count: character.body === 'humanoid' ? 1 : 2,
					})
				} else if (character.heritage === 'nature') {
					deck.push({
						card: UnitRitesPoisonArcana,
						count: character.body === 'humanoid' ? 2 : 1,
					})
				}

				/**
				 * Racial items:
				 * - Mundane human - 'Plains walking' movement item; Ultimate: Permanently add a Wind Arcana into your deck.
				 * - Flame-marked human - 'Plains walking' movement item; Ultimate: Upgrade all Arcanae in your hand.
				 * - Humanoid dryad - Plains walking' movement item; Ultimate: Draw an Arcana for every unit you control.
				 *
				 * - Centaur - Ram it' damage item; 'Hoof it' movement item
				 * - Flame centaur - Full Steam Ahead'; 'Full Steam Behind' movement item
				 * - Deer-dryad - 'Natural Boop' damage item; 'Hop-skip' movement item
				 *
				 * - Harpy - Claw damage item; 'Fly high' | 'Land nigh" movement item
				 * - Phoenix - Claw damage item; 'Fly high' | 'Land nigh" movement item
				 * - Merbird - Claw damage item; 'Fly high' | 'Land nigh" movement item
				 */

				if (character.body === 'humanoid') {
					// items.push(LabyrinthItemCasualDress)
				} else if (character.body === 'equine') {
					// items.push(LabyrinthItemChainmail)
				} else if (character.body === 'avian') {
					// items.push(LabyrinthItemDragonsteelSword)
				}

				game.progression.rites.resetRunState()
				deck.forEach((wrapper) => game.progression.rites.addCardToDeck(player, getClassFromConstructor(wrapper.card), wrapper.count))
				items.forEach((card) => game.progression.rites.addItemToDeck(player, getClassFromConstructor(card)))

				game.progression.rites.saveCharacter(character)
				game.systemFinish(game.getHumanGroup(), GameVictoryCondition.STORY_TRIGGER, true)
			})

		character
	}
}
