import { algoliasearch } from 'algoliasearch';
import config from '../config';

// client
export const client = algoliasearch(
  config.algolia_application_id!,
  config.algolia_write_api_key!
);

// add a record to an index
export const addRecordToAlgoliaIndex = async (
  // objectId is a must property
  // without objectId, operations can not be done on a particular record
  record: Record<string, unknown> & { objectID: string },
  indexName: string
) => {
  return client.saveObject({
    indexName,
    body: record,
  });
};
