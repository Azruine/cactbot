import NetRegexes from '../../../../../resources/netregexes';
import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';
import { kFlagInstantDeath, playerDamageFields } from '../../../oopsy_common';

// TODO: 63DD Skyward Leap during Strength of the Heavens should ignore invulning tanks
// TODO: track missing towers during Sanctity
// TODO: track missing towers during Nidhogg

export interface Data extends OopsyData {
  hasDoom?: { [name: string]: boolean };
}

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.DragonsongsRepriseUltimate,
  damageWarn: {
    'DSR Ser Grinnaux Empty Dimension': '62DA', // donut (phase1 and Wrath)
    'DSR Ser Grinnaux Full Dimension': '62DB', // circle (phase 1)
    'DSR Ser Adelphel Holy Shield Bash': '63EB', // line charge at tethered player
    'DSR Ser Adelphel Shining Blade': '62CE', // dash attack
    'DSR Brightsphere Bright Flare': '62CF', // spheres generated by 62CE Shining Blade
    'DSR Ser Charibert Skyblind': '631A', // puddles after Brightwing cleaves
    'DSR Spiral Thrust': '63D4', // dashes from Ser Vellguine, Ser Ignasse, Ser Paulecrain
    'DSR Ser Gerrique Heavy Impact 1': '63D6', // expanding earth ring
    'DSR Ser Gerrique Heavy Impact 2': '63D7', // expanding earth ring
    'DSR Ser Gerrique Heavy Impact 3': '63D8', // expanding earth ring
    'DSR Ser Gerrique Heavy Impact 4': '63D9', // expanding earth ring
    'DSR Ser Gerrique Heavy Impact 5': '63DA', // expanding earth ring
    'DSR Ser Grinnaux Dimensional Collapse': '63DC', // red/black puddles
    'DSR Ser Charibert Heaven\'s Stake 1': '6FAF', // initial Sanctity of the Ward 4x fire puddles
    'DSR Ser Charibert Heaven\'s Stake 2': '6FB0', // Sanctity of the Ward donut ring before fire/ice
    'DSR King Thordan Broad Swing': '63C2', // 3x directional cleaves
    'DSR Nidhogg Gnashing Wheel': '6715', // "get out" part of Gnash and Lash
    'DSR Nidhogg Lashing Wheel': '6716', // "get in" part of Gnash and Lash
    'DSR Nidhogg Geirskogul': '670A', // baited line aoes from tower clones
    'DSR Nidhogg Drachenlance': '670C', // front conal
    'DSR Vedrfolnir Twisting Dive': '6B8B', // initial dragon dive + twister during Wrath/Death
    'DSR Ser Charibert Altar Flare': '63E4', // 4x big explosions during Wrath of the Heavens
    'DSR Vidofnir Cauterize': '6B8E', // dive during Wrath/Death
    'DSR Darkscale Cauterize': '6B8D', // dive during Wrath/Death
    'DSR Darkscale Chain Lightning': '6B90', // 2x lightning spread during Wrath (doesn't hit player it's on)
    'DSR Ser Zephirin Spear of the Fury': '6B93', // spear line aoe during Death of the Heavens
    'DSR Vidofnir Wings of Salvation': '6B96', // white puddle that creates doom cleanser in Death of the Heavens
  },
  damageFail: {
    'DSR Dimensional Torsion': '62D8', // player tethering a cloud
    'DSR Dimensional Purgation': '62D9', // Ser Adelphel tethering a cloud during charges
    'DSR Ser Charibert Holy Chain': '62E0', // failing to break chains, often kills people
    'DSR Ser Grinnaux Planar Prison': '63EC', // leaving the purple circle
    'DSR Ser Eternal Conviction': '63E0', // messing up towers
    'DSR Holy Comet Holy Impact': '63EA', // meteor explosion from being too close
    'DSR King Thordan Ascalon\'s Mercy Concealed': '63C9', // protean 2nd hit
    'DSR Nidhogg Darkdragon Dive Miss': '671B', // tower failure
  },
  gainsEffectFail: {
    'DSR Burns': 'B81', // fire puddles during Sanctity of the Ward
    'DSR Frostbite': 'B82', // ice puddles during Sanctity of the Ward
  },
  shareWarn: {
    'DSR Ser Adelphel Execution': '62D5', // dive on main tank after 62CE Shining Blade
    'DSR Ser Charibert Heavensflame': '62DF', // spread with 62E0 Holy Chain (also in Death)
    'DSR Ser Charibert Brightwing': '6319', // cleaves during Pure of Heart
    'DSR King Thordan Attack': '63BB', // King Thordan cleave autos
    'DSR King Thordan Lightning Storm': '63CD', // spread during Strength of the Ward
    'DSR Nidhogg Attack': '6730', // Nidhogg cleave autos
    'DSR Nidhogg Dark High Jump': '670E', // sharing a circle marker tower drop
    'DSR Nidhogg Dark Spineshatter Dive': '670F', // sharing an up/forwards arrow marker tower drop
    'DSR Nidhogg Dark Elusive Jump': '6710', // sharing a down/back arrow marker tower drop
    'DSR Nidhogg Darkdragon Dive Share': '6711', // sharing a single tower
    'DSR Spiral Pierce': '6B8A', // Ser Ignasse and Ser Vellguine tether charges during Wrath
    'DSR King Thordan Ascalon\'s Mercy Revealed': '63CB', // protean during Wrath
  },
  shareFail: {
    'DSR King Thordan Ascalon\'s Might': '63C5', // tank cleaves
    'DSR Holy Shield Bash': '62D1', // Ser Adelphel/Janlenoux tank tether stun charges
    'DSR Nidhogg Soul Tether': '671C', // tank tether cleaves
    'DSR Nidhogg Mirage Dive': '68C4', // dives during eye phase, probably a wipe if shared
    'DSR Skyward Leap 1x': '72A2', // Ser Paulecraine single blue marker during Wrath
  },
  soloWarn: {
    'DSR Ser Haumeric Hiemal Storm': '63E7', // Sanctity of the Ward ice pair stacks
  },
  triggers: [
    {
      // Interrupt.
      id: 'DSR Ser Adelphel Holiest Hallowing',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: '62D0' }),
      mistake: (_data, matches) => {
        return { type: 'fail', blame: matches.target, text: matches.ability };
      },
    },
    {
      id: 'DSR King Thordan Gaze',
      // Same abilities during both Thordan1 and Thordan2
      // 63D1 = The Dragon's Gaze (Thordan lookaway)
      // 63D2 = The Dragon's Glory (eye lookaway)
      // Technically there is also a Hysteria status (127) but sometimes this doesn't apply (if somebody dies too soon??).
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: ['63D1', '63D2'], ...playerDamageFields }),
      condition: (data, matches) => data.DamageFromMatches(matches) > 0,
      mistake: (_data, matches) => {
        return { type: 'fail', blame: matches.target, reportId: matches.targetId, text: matches.ability };
      },
    },
    {
      id: 'DSR King Thordan Twister',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: '6B8C', ...playerDamageFields }),
      mistake: (_data, matches) => {
        // Instant death has a special flag value, differentiating
        // from the explosion damage you take when somebody else
        // pops one.
        if (matches.flags === kFlagInstantDeath) {
          return {
            type: 'fail',
            blame: matches.target,
            reportId: matches.targetId,
            text: {
              en: 'Twister Pop',
              de: 'Wirbelsturm berührt',
              fr: 'Apparition des tornades',
              ja: 'ツイスター',
              cn: '旋风',
              ko: '회오리 밟음',
            },
          };
        }
        // If not the one popping, just print "Twister".
        return {
          type: 'fail',
          blame: matches.target,
          reportId: matches.targetId,
          text: matches.ability,
        };
      },
    },
    {
      id: 'DSR Doom Gain',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: 'BA0' }),
      run: (data, matches) => (data.hasDoom ??= {})[matches.target] = true,
    },
    {
      id: 'DSR Doom Lose',
      type: 'LosesEffect',
      netRegex: NetRegexes.losesEffect({ effectId: 'BA0' }),
      run: (data, matches) => (data.hasDoom ??= {})[matches.target] = false,
    },
    {
      // There is no trigger line for when doom runs out, so check slightly
      // before to see if doom was cleared or if we should consider any
      // non-damage death after this a doom.
      id: 'DSR Doom Death',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: 'BA0' }),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
      deathReason: (data, matches) => {
        if (!data.hasDoom || !data.hasDoom[matches.target])
          return;
        return {
          id: matches.targetId,
          name: matches.target,
          text: matches.effect,
        };
      },
    },
  ],
};

export default triggerSet;
