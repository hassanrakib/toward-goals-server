import { Level, RequirementLevel } from '../modules/level/level.model';
import {
  createLevels,
  createRequirementsLevels,
} from '../modules/level/level.util';

export const seedLevels = async () => {
  // check here levels existence and not allow creating levels again
  const totalLevels = await Level.estimatedDocumentCount();

  if (totalLevels > 0) {
    console.log(
      'Levels are already seeded. If you want fresh levels then delete requirementLevels and levels collection plus start the server again.'
    );
    return;
  }

  try {
    // create requirements with levels locally
    const requirementsLevels = createRequirementsLevels();

    // insert to db
    // we have write into the db at this moment
    // before calling the createLevels function which tries to get requirementLevel
    // from the db
    await RequirementLevel.insertMany(requirementsLevels);

    // create levels locally to insert into db
    const levels = await createLevels();

    // insert to db
    await Level.insertMany(levels);
  } catch (err) {
    // drop the collection
    console.log(
      '*** Error happened. Dropping RequirementLevels & Levels collection. ***'
    );
    await RequirementLevel.collection.drop();
    await Level.collection.drop();

    throw err;
  }
};
