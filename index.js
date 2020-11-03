const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const USERS_URL = BASE_URL + "/api/v1/users";
// 一頁要顯示的資料個數
const ITEM_PER_PAGE = 20;
// 一次會顯示的分頁按鈕數量
const SHOW_PAGER = 5;
// 各個選擇器
const peopleListContainer = document.querySelector("#people-list");
const paginationContainer = document.querySelector(".pagination");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
// 在加上分頁按鈕後用來存放 document.querySelector(".go-page")
let pageButtons;
// 存放名單資料
let people = [];
// 存放篩選過名單資料
let filteredPeople = [];
// 儲存顯示模式切換按鈕的節點
const showMode = document.querySelector("#show-mode");
// 儲存目前是 card or list 哪種顯示模式
const DISPLAY_MODE_CARD = "card";
const DISPLAY_MODE_LIST = "list";
let currentShowMode = DISPLAY_MODE_CARD;
// 最多幾頁
let pageAmount;
// 預設第一頁
let currentPage = 1;

// 開始執行
// 取得所有清單
axios
  .get(USERS_URL)
  .then((response) => {
    people = response.data.results;
    // 渲染分頁按鈕
    addPaginationItem(people.length);
    // 取出第一頁的名單
    addPeopleList(getItemsByPage(currentPage));
  })
  .catch((error) => console.log(error));

// 函式區
// 把人物加到 HTML
function addPeopleList(data) {
  let rawHTML = "";
  // 新增: 依據 currentShowMode 產生不同的模板
  data.forEach((item) => {
    rawHTML +=
      currentShowMode === DISPLAY_MODE_CARD
        ? generateCardElement(item)
        : generateListElement(item);
  });
  // 新增: 依據 currentShowMode 產生不同的外包元素
  rawHTML =
    currentShowMode === DISPLAY_MODE_CARD
      ? `<div class="row">${rawHTML}</div>`
      : `<div class="colume">${rawHTML}</div>`;

  peopleListContainer.innerHTML = rawHTML;
}
// 產生 Card 的 HTML
function generateCardElement(item) {
  const rawHTML = `
    <div class="card m-1 p-3 d-flex flex-column justify-content-center align-items-center">
      <img class="card-img-top" src="${item.avatar}" alt="Card image cap">
      <div class="card-body p-1 d-flex flex-column justify-content-center align-items-center">
        <h6 class="card-name">${item.name}</h6>
        <h7 class="card-age">${item.age} years old</h7>
        <h7 class="card-region"><img src="https://www.countryflags.io/${item.region}/flat/32.png"> ${item.region}</h7>    
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" data-id="${item.id}">Detail</button>
      </div>
    </div>
  `;

  return rawHTML;
}
// 產生 List 的 HTML
function generateListElement(item) {
  const rawHTML = `
    <div class="list-item row align-items-center pt-2 pb-2">
      <div class="col-lg-3 font-weight-bold">${item.name}</div>
      <div class="col-lg-3 font-weight-bold">${item.age} years old</div>
      <div class="col-lg-3 font-weight-bold"><img src="https://www.countryflags.io/${item.region}/flat/32.png"> ${item.region}</div>
      <div class="col-lg-3">
      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" data-id="${item.id}">Detail</button>
      </div>
    </div>
  `;

  return rawHTML;
}

// 分頁功能
function addPaginationItem(amount) {
  // 最多幾頁
  pageAmount = Math.ceil(amount / ITEM_PER_PAGE);
  let startIndex, endIndex;
  let rawHTML = "";

  // 總頁數是否小於 SHOW_PAGER
  if (pageAmount < SHOW_PAGER) {
    startIndex = 1;
    endIndex = pageAmount;
  } else {
    // 有三種情況
    if (currentPage <= Math.floor(SHOW_PAGER / 2)) {
      // 點擊 1~2 頁時
      startIndex = 1;
      endIndex = SHOW_PAGER;
    } else if (currentPage > (pageAmount - Math.floor(SHOW_PAGER / 2))) {
      // 點擊最後2頁時
      startIndex = pageAmount - SHOW_PAGER + 1;
      endIndex = pageAmount;
    } else {
      // 點擊中間頁數時
      startIndex = currentPage - Math.floor(SHOW_PAGER / 2);
      endIndex = currentPage + Math.floor(SHOW_PAGER / 2);
    }
  }

  // 先組裝中間頁數按鈕
  for (let i = startIndex; i <= endIndex; i++) {
    rawHTML +=
      (i === currentPage)
        ? `<li class="page-item go-page active"><a class="page-link" href="#">${i}</a></li>`
        : `<li class="page-item go-page"><a class="page-link" href="#">${i}</a></li>`;
  }
  // 加上 previous and next 按鈕
  rawHTML = `
    <li class="page-item previous"><a class="page-link previous" href="#">Previous</a></li>
    ${rawHTML}
    <li class="page-item next"><a class="page-link" href="#">Next</a></li>
  `;

  paginationContainer.innerHTML = rawHTML;
}
// 取得指定頁面的資料
function getItemsByPage(page) {
  const data = filteredPeople.length ? filteredPeople : people;
  const startIndex = (page - 1) * ITEM_PER_PAGE;

  // 將現在分頁存起來
  currentPage = page;
  // 重新渲染分頁按鈕
  addPaginationItem(data.length);

  return data.slice(startIndex, startIndex + ITEM_PER_PAGE);
}
// 取得上一頁資料
function goPrevious() {
  // 如果小於第一頁就離開
  if (currentPage - 1 < 1) return;
  // 更新當前頁數
  currentPage--;

  addPeopleList(getItemsByPage(currentPage));
}
// 取得下一頁資料
function goNext() {
  // 如果大於最後一頁就離開
  if (currentPage + 1 > pageAmount) return;
  // 更新當前頁數
  currentPage++;

  addPeopleList(getItemsByPage(currentPage));
}
// 取得指定頁資料
function goPage(page) {
  // 更新當前頁數
  currentPage = page;

  addPeopleList(getItemsByPage(currentPage));
}

// 過濾掉不想顯示的資料
function isNeededData(key) {
  switch (key) {
    case "id":
    case "avatar":
    case "name":
    case "surname":
    case "email":
      return false;
    default:
      return true;
  }
}
// 取得性別條件
function getGenderFilterValue() {
  return $('#gender-group input:checked').val();
}

// 是否符合篩選性別
function isMatchedGender(type, filteredGender) {
  // 若是 all 就一律回傳 true
  return filteredGender === 'all' ? true : (type === filteredGender);
}

// 是否符合姓名
function isMatchedName(name, keyword) {
  return name.toLowerCase().includes(keyword);
}

// 監聽器區
// 分頁按鈕監聽器
paginationContainer.addEventListener("click", event => {
  if (event.target.parentElement.classList.contains("go-page")) {
    goPage(parseInt(event.target.innerHTML));
  } else if (event.target.parentElement.classList.contains("previous")) {
    goPrevious();
  } else {
    goNext();
  }
});

// 切換不同顯示模式
showMode.addEventListener("click", event => {
  const keyword = searchInput.value.trim().toLowerCase();

  if (event.target.matches("#card-mode")) {
    currentShowMode = DISPLAY_MODE_CARD;
  } else if (event.target.matches("#list-mode")) {
    currentShowMode = DISPLAY_MODE_LIST;
  }
  // 若有輸入但找不到的情況就離開
  if (filteredPeople.length === 0 && keyword) {
    return;
  }
  // 重新渲染 HTML
  addPeopleList(getItemsByPage(currentPage));
});

//listen to search form
searchForm.addEventListener("submit", event => {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  const filteredGender = getGenderFilterValue();

  filteredPeople = people.filter((person) => {
    return isMatchedName(person.name, keyword)
      && isMatchedGender(person.gender, filteredGender)
  });
  // 有輸入但清單找不到
  if (filteredPeople.length === 0 && keyword) {
    peopleListContainer.innerHTML = `
      <div class="alert alert-warning text-center mt-2" role="alert">
        <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        No Matched Person
      </div>
    `;
    paginationContainer.innerHTML = '';
    return;
  }

  // 渲染分頁按鈕
  addPaginationItem(filteredPeople.length);
  // 取出第一頁的名單
  addPeopleList(getItemsByPage(1));
});

// 彈窗
$("#exampleModal").on("show.bs.modal", function (event) {
  const button = $(event.relatedTarget);
  const dataId = button.data("id");
  const modal = $(this);
  let detailList = "";
  let bodyContent = "";
  let personDetail;

  modal.find(".modal-body")[0].innerHTML = "Loading...";

  axios
    .get(`${BASE_URL}/api/v1/users/${dataId}`)
    .then((response) => {
      personDetail = response.data;

      for (let key in personDetail) {
        if (isNeededData(key)) {
          detailList += `
            <div>${key} : ${personDetail[key]}</div>
          `;
        }
      }

      bodyContent = `
        <div class="d-flex justify-content-center">
          <div class="image d-flex justify-content-center align-items-center">
            <img class="rounded-circle" src="${personDetail.avatar}" alt="Avatar image">
          </div>
          <div class="detail">
            ${detailList}
          </div>
        </div> 
      `;

      modal
        .find(".modal-title")
        .text(`${personDetail.name} ${personDetail.surname}`);
      modal.find(".modal-body")[0].innerHTML = bodyContent;
    })
    .catch((error) => console.log(error));
});
