//***** USE THE SCRIPT COMMAND FROM PACKAGE.JSON *****/

// import mongoose from 'mongoose';
// import { Level, RequirementLevel } from '../modules/level/level.model';
// import {
//   createLevels,
//   createRequirementsLevels,
// } from '../modules/level/level.util';
// import config from '../config';

// const seedLevels = async () => {
//   // connect to mongodb first before doing the operations
//   await mongoose.connect(config.db_connection_uri!);

//   // check here levels existence and not allow creating levels again
//   const totalLevels = await Level.estimatedDocumentCount();

//   if (totalLevels > 0) {
//     return {
//       success: false,
//       message:
//         'Levels are already seeded. If you want fresh levels then delete requirementLevels and levels collection plus start the server again.',
//     };
//   }

//   try {
//     // create requirements with levels locally
//     const requirementsLevels = createRequirementsLevels();

//     // insert to db
//     // we have write into the db at this moment
//     // before calling the createLevels function which tries to get requirementLevel
//     // from the db
//     await RequirementLevel.insertMany(requirementsLevels);

//     // create levels locally to insert into db
//     const levels = await createLevels();

//     // insert to db
//     await Level.insertMany(levels);

//     // return a success response
//     return { success: true, message: 'Successful seeding levels 🔥' };
//   } catch (err) {
//     // drop the collection
//     console.log(
//       '*** Error happened. Dropping RequirementLevels & Levels collection... ***'
//     );
//     await RequirementLevel.collection.drop();
//     await Level.collection.drop();

//     // the error will be catched inside catch block
//     throw err;
//   }
// };

// seedLevels()
//   .then((res) => {
//     console.log(res.message);
//   })
//   .catch((err: unknown) => {
//     console.log(`Error here =>> ${(err as Error).message}`);
//   });
