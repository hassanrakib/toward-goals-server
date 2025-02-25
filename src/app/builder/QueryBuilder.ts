import { FilterQuery, Query } from 'mongoose';

export interface QueryParams {
  searchTerm?: string;
  sort?: string;
  limit?: string;
  page?: string;
  fields?: string;
  [key: string]: unknown;
}

export default class QueryBuilder<T> {
  // modelQuery<ResultType, DocType> mongoose query object
  public modelQuery: Query<T[], T>;
  public query: QueryParams;

  constructor(modelQuery: Query<T[], T>, query: QueryParams) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  protected getExcludedFields(): string[] {
    return ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  }

  private parseCommaSeparatedFields(
    fields: string | undefined,
    defaultValue: string
  ): string {
    return fields ? fields.split(',').join(' ') : defaultValue;
  }

  search(searchableFields: string[]) {
    // if searchTerm is not sent in the query obj set searchTerm to empty string
    const searchTerm = this.query.searchTerm ?? '';

    this.modelQuery = this.modelQuery.find({
      $or: searchableFields.map(
        (field) =>
          ({
            [field]: {
              $regex: searchTerm,
              $options: 'i',
            },
          }) as FilterQuery<T>
      ),
    });

    return this;
  }

  filter() {
    const filter = { ...this.query };
    this.getExcludedFields().forEach((field) => delete filter[field]);

    this.modelQuery = this.modelQuery.find(filter as FilterQuery<T>);

    return this;
  }

  sort() {
    const sort: string = this.parseCommaSeparatedFields(
      this.query.sort,
      '-createdAt'
    );
    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }

  selectFields() {
    const fields: string = this.parseCommaSeparatedFields(
      this.query.fields,
      ''
    );
    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }

  paginate() {
    const currentPage = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (currentPage - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  async getPaginationInformation() {
    const totalQueries = this.modelQuery.getFilter();
    const totalDocuments =
      await this.modelQuery.model.countDocuments(totalQueries);
    const currentPage = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(totalDocuments / limit);

    return { currentPage, limit, totalDocuments, totalPage };
  }
}
