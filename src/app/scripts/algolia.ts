import { IndexSettings } from 'algoliasearch';
import { client } from '../utils/algolia';

const setAlgoliaIndexSettings = async (
  indexName: string,
  indexSettings: IndexSettings
) => {
  return client.setSettings({
    indexName,
    indexSettings,
  });
};

// set settings for any index
setAlgoliaIndexSettings('habitUnits', {
  searchableAttributes: ['type', 'unordered(name)'],
  customRanking: ['desc(usageCount)'],
})
  .then((response) => {
    console.log(response);
  })
  .catch((reason: unknown) => {
    console.log(reason);
  });
