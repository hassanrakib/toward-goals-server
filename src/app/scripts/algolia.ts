//***** USE THE SCRIPT COMMAND FROM PACKAGE.JSON *****/

// import { IndexSettings } from 'algoliasearch';
// import { client } from '../utils/algolia';

// const setAlgoliaIndexSettings = async (
//   indexName: string,
//   indexSettings: IndexSettings
// ) => {
//   return client.setSettings({
//     indexName,
//     indexSettings,
//   });
// };

// set settings for any index
// setAlgoliaIndexSettings('habitUnits', {
//   searchableAttributes: ['type', 'unordered(name)'],
//   customRanking: ['desc(usageCount)'],
// })
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((reason: unknown) => {
//     console.log(reason);
//   });

// clear all records from an index without touching configs
// client
//   .clearObjects({ indexName: 'rewards' })
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err: unknown) => {
//     console.log(`Error here =>> ${(err as Error).message}`);
//   });
