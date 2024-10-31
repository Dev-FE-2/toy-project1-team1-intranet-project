import 'material-symbols';
import { fetchCollectionData } from '../../../utils/fetchCollectionData';
export default async function Announcement() {
  const noticeData = await fetchCollectionData('notices');
  const urlParams = new URLSearchParams(window.location.search); // URL의 쿼리스트링 파라미터 가져오기
  const INIT_NOTICE_INFO_VALUE = urlParams.get('noticeinfo');
  //메모리상에 모든 것을 다 만들어 놓을 변수

  const container = document.createElement('div');
  container.classList.add('container', 'announcement');

  container.innerHTML = `
    <div class="container__title title">
      <h1 class="title">공지사항</h1>
      <div class="announcement__search-box">
        <input type="search" id="search" placeholder="검색어를 입력하세요" />
        <span class="material-symbols-outlined">search</span>
      </div>
    </div>
    <div class="postcard-container"></div>
    <div class="pagination">
      <ul class="paging-list" role="list"></ul>
    </div>
  `;

  function pagination() {
    const totalCount = noticeData.length;
    const limit = 8;
    // 페이지와 데이터 바인딩의 핵심 flag
    let currentPage = 1;
    let totalPage = Math.ceil(totalCount / limit);
    const pageCount = totalCount > 40 ? 5 : totalPage;
    let pageGroup = Math.ceil(currentPage / pageCount);
    let lastPage = pageGroup * pageCount;
    let firstPage = lastPage - (pageCount - 1);

    const searchInput = container.querySelector('input[type="search"]');
    const searchButton = container.querySelector('.material-symbols-outlined');

    const initialPage = urlParams.get('page')
      ? Number(urlParams.get('page'))
      : 1; // 페이지 파라미터 값 가져오기
    const initialSearch = urlParams.get('search') || ''; // 검색어 파라미터 값 가져오기
    currentPage = initialPage; // 현재 페이지 설정
    searchInput.value = initialSearch; // 검색어 입력창에 초기값 설정

    // - `encodeURIComponent`를 사용하여 검색어를 인코딩하여 URL에 포함 시킬 수 있도록 수정하였습니다.
    function updateHistory(pageNumber, searchTerm = '') {
      // 히스토리 상태를 업데이트하는 함수
      const newQuery = `?page=${pageNumber}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`; // 쿼리스트링 생성

      if (window.location.search !== newQuery) {
        // 현재 URL과 다를 경우에만 히스토리 업데이트
        history.pushState(
          { page: pageNumber, search: searchTerm },
          '', // title을 비워 두고 URL 쿼리스트링 추가
          newQuery,
        );
      }
    }

    //히스토리 변화를 감지하기 위한 코드 => 이거없으면 helpertext관리못함
    window.addEventListener('popstate', event => {
      const { page, search } = event.state || {}; // 상태에서 페이지와 검색어 가져오기
      if (page) {
        currentPage = page; // 히스토리 상태에서 currentPage 업데이트
      }
      // 검색어가 있는 경우
      if (search) {
        searchInput.value = search; // 이전 검색어로 검색 입력 필드 업데이트
        handleSearch(); // handleSearch 호출하여 필터링된 데이터와 페이지네이션 업데이트
      } else {
        currentPage = 1; // 검색어가 없으면 1페이지로 리셋
        updatePagination('', false); // 검색 없이 페이지네이션 리셋
        container.querySelector('.helper-text')?.remove(); // helper-text 제거
      }
    });

    const page = container.querySelector('.paging-list');
    4;

    function pageRendering() {
      page.innerHTML = '';
      if (currentPage > 1) {
        page.insertAdjacentHTML(
          'beforeend',
          `<li class="paging-item prev">
           <button type="button" aria-label="이전 페이지">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 34 34">
               <line x1="20" y1="6" x2="12" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
               <line x1="12" y1="17" x2="20" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
             </svg>
           </button>
         </li>`,
        );
      }

      for (let i = firstPage; i <= lastPage; i += 1) {
        const activeClass = i === currentPage ? 'is-active' : '';
        page.insertAdjacentHTML(
          'beforeend',
          `<li class="paging-item ${activeClass}"><a href="javascript:void(0);">${i}</a></li>`,
        );
      }

      if (currentPage < totalPage) {
        page.insertAdjacentHTML(
          'beforeend',
          `<li class="paging-item next">
           <button type="button" aria-label="다음 페이지">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 34 34">
               <line x1="14" y1="6" x2="22" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
               <line x1="22" y1="17" x2="14" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
             </svg>
           </button>
         </li>`,
        );
      }

      attachEvent();
    }

    function attachEvent() {
      const prevBtn = container.querySelector('.paging-item.prev button');

      prevBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage -= 1;
          const searchTerm = searchInput.value.trim().toLowerCase();
          updatePagination(searchTerm, true);
        }
      });

      const nextBtn = container.querySelector('.paging-item.next button');

      nextBtn?.addEventListener('click', () => {
        if (currentPage < totalPage) {
          currentPage += 1;
          const searchTerm = searchInput.value.trim().toLowerCase();
          updatePagination(searchTerm, true);
        }
      });

      const pageItems = container.querySelectorAll('.paging-item a');

      pageItems.forEach(cur => {
        cur.addEventListener('click', event => {
          const selectedPage = Number(event.target.textContent);
          currentPage = selectedPage;
          const searchTerm = searchInput.value.trim().toLowerCase();
          updatePagination(searchTerm, true);
        });
      });
    }

    const postContainer = container.querySelector('.postcard-container');

    function renderPosts(posts = noticeData) {
      postContainer.innerHTML = '';

      if (posts.length === 0) {
        postContainer.classList.add('no-result');
        postContainer.innerHTML = `<p>찾으시는 게시물이 없습니다.</p>`;
        return;
      } else {
        postContainer.classList.remove('no-result');
      }

      const start = (currentPage - 1) * limit;
      const end = start + limit;
      const currentPosts = posts.slice(start, end); // 현재 페이지에 해당하는 공지사항만 잘라서 가져옴

      function cuttingString(text = '', limit) {
        if (text.length > limit) {
          return text.slice(0, limit) + '...';
        }
        return text;
      }

      currentPosts.forEach(post => {
        const postHTML = `
        <div class="postcard" data-id="${post.id}">
          <img class="postcard-img" src="${post.image}" alt="Post Image"/>
          <div class="contents">
            <h2 class="contents__title">${cuttingString(post.title, 20)}</h2>
            <p class="contents__content">${cuttingString(post.contents, 40)}</p>
            <div class="contents__information">
              <span class="information-author">${cuttingString(post.author, 10)}</span>
              <span class="information-date">${cuttingString(post.updateAt ? cuttingString(post.updateAt, 15) : cuttingString(post.writedAt, 15))}</span>
            </div>
          </div>
        </div>
      `;
        postContainer.insertAdjacentHTML('beforeend', postHTML);
      });

      const postcards = postContainer.querySelectorAll('.postcard');

      postcards.forEach(card => {
        card.addEventListener('click', () => {
          const postId = card.dataset.id;
          urlParams.set('noticeinfo', postId);
          history.pushState(null, null, `?${urlParams.toString()}`);
          renderNoticeDetail(postId);
        });
      });
    }

    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') handleSearch();
    });
    searchButton.addEventListener('click', handleSearch);

    function getFilteredData(searchTerm) {
      return searchTerm
        ? noticeData.filter(post =>
            post.title.toLowerCase().includes(searchTerm),
          )
        : noticeData;
    }

    function handleSearch() {
      const searchTerm = searchInput.value.trim().toLowerCase(); // 검색어 가져오기
      currentPage = 1;
      const filteredData = getFilteredData(searchTerm);
      container.querySelector('.helper-text')?.remove();
      let textStyle = '';
      textStyle = filteredData.length === 0 ? 'text-error' : 'text-success';
      postContainer.insertAdjacentHTML(
        'beforebegin',
        `<p class="helper-text">검색결과 <span class="${textStyle}">${filteredData.length}개</span>의 게시물</p>`,
      );
      updatePagination(searchTerm, true);
    }

    // - 새로운 `filteredData` 배열을 받아 페이지네이션과 게시물 목록을 업데이트
    // - `updateHistoryFlag` 플래그로 히스토리 업데이트 여부를 제어
    function updatePagination(searchTerm = '', updateHistoryFlag = false) {
      const filteredData = getFilteredData(searchTerm);
      totalPage = Math.ceil(filteredData.length / limit);
      pageGroup = Math.ceil(currentPage / pageCount);
      lastPage = pageGroup * pageCount;
      firstPage = lastPage - (pageCount - 1);
      if (totalPage === 0)
        currentPage = 1; // 검색 결과가 없을 경우 첫 페이지로 설정
      else if (currentPage > totalPage) currentPage = totalPage; // 현재 페이지가 전체 페이지를 초과하지 않도록 제한
      if (lastPage > totalPage) lastPage = totalPage; // 마지막 페이지가 전체 페이지를 초과하지 않도록 제한

      pageRendering();
      renderPosts(filteredData); // 필터링된 데이터로 게시물 렌더링

      if (updateHistoryFlag) {
        // 히스토리 업데이트 플래그가 true일 경우에만 히스토리 업데이트
        updateHistory(currentPage, searchTerm);
      }
    }

    if (INIT_NOTICE_INFO_VALUE) {
      renderNoticeDetail(INIT_NOTICE_INFO_VALUE);
    } else {
      renderPosts(noticeData);
    }

    //초기 렌더링
    pageRendering(); // 처음에 페이지 버튼들을 그림
    updatePagination(initialSearch, false); // 초기 렌더링 시 필터링과 히스토리 업데이트 방지
  }

  pagination();

  async function renderNoticeDetail(postId) {
    container.innerHTML = '';
    const specificNotice = noticeData.find(post => post.id === postId);
    if (!specificNotice) return;
    const detailContainer = document.createElement('div');
    detailContainer.classList.add('notice-info-wrapper');
    detailContainer.innerHTML = `
    <div class="notice-info">
      <h2>공지사항 상세 조회</h2>
      <div class="content-img">
        <img class="img-preview" src="${specificNotice.image}" alt="기본공지사항이미지" />
      </div>
      <div class="content-contents">
        <div class="content-title">
      <div class="title-primary">${specificNotice.title}</div>
      <span class="title-secondary">
        <div class="secondary-component">${specificNotice.author}</div>
        <div class="secondary-component">${specificNotice.updateAt ? specificNotice.updateAt : specificNotice.writedAt}</div>
      </span>
    </div>
      </div>
      <textarea class="content-content" name="" id="" readonly>${specificNotice.contents}</textarea>
    </div>
    <div class="button-box">
      <button class="btn btn-outline close--btn">닫기</button>
    </div>
  `;

    const closeButton = detailContainer.querySelector('.close--btn');

    closeButton.addEventListener('click', () => {
      window.history.back();
    });

    container.prepend(detailContainer);
  }

  return container;
}
