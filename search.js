const inputElement = document.querySelector("#search-input");
const search_icon = document.querySelector("#search-close-icon");
const sort_wrapper = document.querySelector(".sort-wrapper");

inputElement.addEventListener("input", () => {
  handleInputChange(inputElement);
});

search_icon.addEventListener("click", handleSearchCloseOnClick);
sort_wrapper.addEventListener("click", handleSortIconOnClick);

function handleInputChange(inputElement) {
  const inputValue = inputElement.value;

  if (inputValue !== "") {
    document
      .querySelector("#search-close-icon")
      .classList.add("search-close-icon-visible");
  } else {
    document
      .querySelector("#search-close-icon")
      .classList.remove("search-close-icon-visible");
  }
}

function handleSearchCloseOnClick() {
  document.querySelector("#search-input").value = "";
  document
    .querySelector("#search-close-icon")
    .classList.remove("search-close-icon-visible");
}

function handleSortIconOnClick(e) {
  e.stopPropagation();

  document
    .querySelector(".filter-wrapper")
    .classList.add("filter-wrapper-open");

  document
    .querySelector("body")
    .classList.add("filter-wrapper-overlay");
}


document.addEventListener("click", function (e) {
  const filterWrapper = document.querySelector(".filter-wrapper");
  const sortWrapper = document.querySelector(".sort-wrapper");

  if (!sortWrapper.contains(e.target)) {
    filterWrapper.classList.remove("filter-wrapper-open");
    document.body.classList.remove("filter-wrapper-overlay");
  }
});