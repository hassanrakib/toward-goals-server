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
setAlgoliaIndexSettings('goals', {
  //   searchableAttributes: ['unordered(title)'],
  //   customRanking: ['desc(userCount)'],
})
  .then((response) => {
    console.log(response);
  })
  .catch((reason: unknown) => {
    console.log(reason);
  });
