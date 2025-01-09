// if somebody worked for the day
// reward him for the requirements by calculating total points by their level
// requirements percentages will change after every todo completion
// because we will update goal progress after every todo completion
const levels = [
  {
    level: 0,
    badgeImage: 'url',
    requirements: {
      /* 
      workStreak.total + workStreak.current + skipped days = 100% =>
      workStreak.total + workStreak.current = 10% => net = 10% => 1 point (1 % = 0.1p)
      */
      consistency: { min: 0, max: 10 },
      // mini + plus + elite = 100% => plus + elite = 10% => net 10% = 1 point (1% = 0.1p)
      deepFocus: { min: 0, max: 10 },
      // missed + met = 100 % => met = 10% => net 10% = 1 point (1% = 0.1p)
      commitment: { min: 0, max: 10 },
    },
    rewardPoints: {
      // complete level up
      forLevelUp: 10,
      // for every requirement
      perRequirement: 1,
    },
  },
  {
    level: 1,
    badgeImage: 'url',
    requirements: {
      consistency: { min: 11, max: 20 },
      deepFocus: { min: 11, max: 20 },
      commitment: { min: 11, max: 20 },
    },
    rewardPoints: {
      forLevelUp: 20,
      perRequirement: 2,
    },
  },
  {
    level: 2,
    badgeImage: 'url',
    requirements: {
      consistency: { min: 21, max: 30 },
      deepFocus: { min: 21, max: 30 },
      commitment: { min: 21, max: 30 },
    },
    rewardPoints: {
      levelUp: 30,
      requirement: 3,
    },
  },
  {
    level: 3,
    badgeImage: 'url',
    requirements: {
      consistency: { min: 31, max: 40 },
      deepFocus: { min: 31, max: 40 },
      commitment: { min: 31, max: 40 },
    },
    rewardPoints: {
      levelUp: 40,
      requirement: 4,
    },
  },
  {
    level: 4,
    badgeImage: 'url',
    requirements: {
      consistency: { min: 41, max: 50 },
      deepFocus: { min: 41, max: 50 },
      commitment: { min: 41, max: 50 },
    },
    rewardPoints: {
      levelUp: 50,
      requirement: 5,
    },
  },
  {
    level: 5,
    badgeImage: 'url',
    requirements: {
      consistency: { min: 51, max: 60 },
      deepFocus: { min: 51, max: 60 },
      commitment: { min: 51, max: 60 },
    },
    rewardPoints: {
      levelUp: 60,
      requirement: 6,
    },
  },
  {
    level: 6,
    badgeImage: 'url',
    requirements: {
      consistency: { min: 61, max: 70 },
      deepFocus: { min: 61, max: 70 },
      commitment: { min: 61, max: 70 },
    },
    rewardPoints: {
      levelUp: 70,
      requirement: 7,
    },
  },
  {
    level: 7,
    badgeImage: 'url',
    requirements: {
      consistency: { min: 71, max: 80 },
      deepFocus: { min: 71, max: 80 },
      commitment: { min: 71, max: 80 },
    },
    rewardPoints: {
      levelUp: 80,
      requirement: 8,
    },
  },
  {
    level: 8,
    badgeImage: 'url',
    requirements: {
      consistency: { min: 81, max: 90 },
      deepFocus: { min: 81, max: 90 },
      commitment: { min: 81, max: 90 },
    },
    rewardPoints: {
      levelUp: 90,
      requirement: 9,
    },
  },
  {
    level: 9,
    badgeImage: 'url',
    requirements: {
      consistency: { min: 91, max: 100 },
      deepFocus: { min: 91, max: 100 },
      commitment: { min: 91, max: 100 },
    },
    rewardPoints: {
      levelUp: 100,
      requirement: 10,
    },
  },
];

console.log(`${levels.length} level created`);
