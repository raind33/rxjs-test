import { of, fromEvent, combineLatest, BehaviorSubject, merge } from 'rxjs';
import {
  map,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  share,
  shareReplay,
  filter,
  take,
  startWith,
  catchError,
  scan
} from 'rxjs/operators';
import * as domUtils from './dom-utils';
import * as dataUtils from './data-utils';

const keyword$ = fromEvent(document.querySelector('#keyword'), 'input').pipe(
  map(event => event.target.value),
  startWith(''),
  shareReplay(1)
);



// 搭配各種 operators 來查詢建議清單
// 兼顧效能與資料準確度
keyword$
  .pipe(
    debounceTime(700),
    distinctUntilChanged(),
    filter(keyword => keyword.length >= 3),
    switchMap(keyword => dataUtils.getSuggestions(keyword))
  )
  .subscribe(suggestions => {
    domUtils.fillAutoSuggestions(suggestions);
  });

const search$ = fromEvent(document.querySelector('#search'), 'click');



// 使用搭配 take(1) 確保只會取得一次
const keywordForSearch$ = keyword$.pipe(take(1));

const searchByKeyword$ = search$.pipe(
  switchMap(() => keywordForSearch$),
  filter(keyword => !!keyword)
);



const sortBy$ = new BehaviorSubject({ sort: 'stars', order: 'desc' });
const changeSort = (sortField) => {
  if (sortField === sortBy$.value.sort) {
    sortBy$.next({
      sort: sortField,
      order: sortBy$.value.order === 'asc' ? 'desc' : 'asc'
    });
  } else {
    sortBy$.next({
      sort: sortField,
      order: 'desc'
    });
  }
};

fromEvent(document.querySelector('#sort-stars'), 'click').subscribe(() => {
  changeSort('stars');
});
fromEvent(document.querySelector('#sort-forks'), 'click').subscribe(() => {
  changeSort('forks');
});

const perPage$ = fromEvent(document.querySelector('#per-page'), 'change').pipe(
  map(event => +event.target.value)
);

const previousPage$ = fromEvent(
  document.querySelector('#previous-page'),
  'click'
).pipe(map(() => -1));

const nextPage$ = fromEvent(document.querySelector('#next-page'), 'click').pipe(
  map(() => 1)
);

const page$ = merge(previousPage$, nextPage$).pipe(
  scan((currentPageIndex, value) => {
    const nextPage = currentPageIndex + value;
    return nextPage < 1 ? 1 : nextPage;
  }, 1)
);

// 顯示頁碼
page$.subscribe(page => {
  domUtils.updatePageNumber(page);
});

// 顯示 stars 排序資訊
sortBy$.pipe(filter(sort => sort.sort === 'stars')).subscribe(sort => {
  domUtils.updateStarsSort(sort);
});

// 顯示 forks 排序資訊
sortBy$.pipe(filter(sort => sort.sort === 'forks')).subscribe(sort => {
  domUtils.updateForksSort(sort);
});

// 開始進行搜尋的相關條件
const startSearch$ = combineLatest([
  searchByKeyword$,
  sortBy$,
  page$.pipe(startWith(1)),
  perPage$.pipe(startWith(10))
]);

// 搜尋條件一變更，就執行 domUtils.loading() 遮罩畫面
startSearch$.subscribe(() => {
  domUtils.loading();
});

const getSearchResult = (
  keyword,
  sort,
  order,
  page,
  perPage
) =>
  dataUtils.getSearchResult(keyword, sort, order, page, perPage).pipe(
    map(result => ({ success: true, message: null, data: result })),
    catchError(error => {
      return of({
        success: false,
        message: error.response.message,
        data: []
      });
    })
  );

// 依照搜尋條件進行搜尋
const searchResult$ = startSearch$.pipe(
  switchMap(([keyword, sort, page, perPage]) =>
    getSearchResult(keyword, sort.sort, sort.order, page, perPage)
  ),
  // searchResult$ 有多次訂閱
  // 因此使用 share 避免重複請求資料
  share()
);

// 處理畫面顯示
searchResult$.subscribe(result => {
  domUtils.fillSearchResult(result.data);
  domUtils.loaded();
});

// 處理錯誤提示
searchResult$.pipe(filter(result => !result.success)).subscribe(result => {
  alert(result.message);
});
