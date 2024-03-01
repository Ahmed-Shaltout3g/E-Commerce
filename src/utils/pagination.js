export const pagination = ({ page = 1, size = 10 } = {}) => {
  if (page <= 0) page = 1;
  if (size <= 0) size = 10;
  const perPages = parseInt(size);
  const skip = (parseInt(page) - 1) * perPages;
  const currentPage = parseInt(page);
  const nextPage = parseInt(page) + 1;
  const prePage = parseInt(page) - 1;

  return {
    perPages,
    skip,
    currentPage,
    nextPage,
    prePage,
  };
};
