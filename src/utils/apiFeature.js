import { pagination } from "./pagination.js";

export class ApiFeature {
  constructor(mongooseQuery, queryData) {
    (this.mongooseQuery = mongooseQuery),
      (this.queryData = queryData),
      (this.paginationInfo = {});
  }

  // ---------------pagination-------------
  paginated() {
    const { page, size } = this.queryData;
    const { perPages, skip, currentPage, nextPage, prePage } = pagination({
      page,
      size,
    });

    this.paginationInfo = {
      perPages,
      skip,
      currentPage,
      nextPage,
      prePage,
    };
    this.mongooseQuery.limit(perPages).skip(skip);
    return this;
  }

  // ---------------sort ---------------------
  sort() {
    this.mongooseQuery.sort(this.queryData.sort?.replaceAll(",", " "));

    return this;
  }

  // ---------------------select------------
  select() {
    this.mongooseQuery.select(this.queryData.select?.replaceAll(",", " "));
    return this;
  }

  // -------------------filters------------------
  filters() {
    const queryInstance = { ...this.queryData };
    const execludeKeys = ["page", "size", "sort", "select", "search"];
    execludeKeys.forEach((key) => delete queryInstance[key]);
    const queryString = JSON.parse(
      JSON.stringify(queryInstance).replace(
        /gte|gt|lt|lte|in|nin|neq|regex/g,
        (match) => `$${match}`
      )
    );
    this.mongooseQuery.find(queryString);
    return this;
  }

  // ------------------search------------------

  search() {
    this.queryData.search
      ? this.mongooseQuery.find({
          $or: [
            { title: { $regex: this.queryData.search, $options: "i" } },
            { desc: { $regex: this.queryData.search, $options: "i" } },
          ],
        })
      : "";
    return this;
  }
}
