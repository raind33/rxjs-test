export const fillAutoSuggestions = (suggestions) => {
  const suggestionElement = document.querySelector("#suggestions");
  suggestionElement.innerHTML = "";
  suggestions.forEach(suggestion => {
    const optionElement = document.createElement("option");
    optionElement.append(document.createTextNode(suggestion));
    suggestionElement.append(optionElement);
  });
};

export const fillSearchResult = (
  searchResult
) => {
  const repositoriesTableBodyElement = document.querySelector(
    "#repositories tbody"
  );
  repositoriesTableBodyElement.innerHTML = "";
  searchResult.forEach(repository => {
    const rowElement = document.createElement("tr");
    const cellNameElement = document.createElement("td");
    const cellStarsElement = document.createElement("td");
    const cellForksElement = document.createElement("td");

    cellNameElement.append(document.createTextNode(repository.name));
    cellStarsElement.append(
      document.createTextNode(repository.stars.toString())
    );
    cellForksElement.append(
      document.createTextNode(repository.forks.toString())
    );
    rowElement.append(cellNameElement);
    rowElement.append(cellStarsElement);
    rowElement.append(cellForksElement);

    repositoriesTableBodyElement.append(rowElement);
  });
};

export const loading = () => {
  const loadingBlockElement = document.querySelector(
    "#loading-block"
  )
  const bodyElement = document.querySelector("body")
  loadingBlockElement.style.width =
    bodyElement.getBoundingClientRect().width + "px";
  loadingBlockElement.style.height =
    bodyElement.getBoundingClientRect().height + "px";
  loadingBlockElement.style.display = "block";
};

export const loaded = () => {
  (document.querySelector("#loading-block")).style.display =
    "none";
};

export const updatePageNumber = (pageNumber) => {
  document.querySelector("#page-number").innerHTML = pageNumber.toString();
};

const getStarsOrderElement = () => {
  return document.querySelector("#sort-stars-icon");
};

const getForksOrderElement = () => {
  return document.querySelector("#sort-forks-icon");
};

const clearSortOrder = () => {
  const starsOrderElement = getStarsOrderElement();
  const forksOrderElement = getForksOrderElement();
  starsOrderElement.innerHTML = "";
  forksOrderElement.innerHTML = "";
};

const updateSortOrder = (target, order) => {
  const iconElement = document.createElement('i');
  iconElement.classList.add('fa');
  iconElement.classList.add(order === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
  target.append(iconElement);
}

export const updateStarsSort = (sort) => {
  clearSortOrder();
  updateSortOrder(getStarsOrderElement(), sort.order)
};

export const updateForksSort = (sort) => {
  clearSortOrder();
  updateSortOrder(getForksOrderElement(), sort.order)
};

