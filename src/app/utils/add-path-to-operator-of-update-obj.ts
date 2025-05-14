// add path to operators like $inc, $push of a mongodb update object
export const addPathToOperatorOfUpdateObj = (
  updateObj: Record<string, unknown>,
  operator: string,
  path: string,
  value: unknown
) => {
  // copy if previously updateObj[operator] has paths or assign empty object
  // it is necessary because you can't directly assign value to updateObj[operator][path]
  // as updateObj[operator] can be undefined
  if (!updateObj[operator]) {
    updateObj[operator] = {};
  }

  // add new path to operator
  (updateObj[operator] as Record<string, unknown>)[path] = value;
};
