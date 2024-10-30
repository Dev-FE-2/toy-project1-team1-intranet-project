import 'material-symbols';

import { fetchCollectionData } from '../../../utils/fetchCollectionData';
let isAnnouncementSectionCreated = false;
export default async function Announcement() {
  // 공지사항 데이터를 저장할 배열
  const noticeData = await fetchCollectionData('notices');

  function pagination() {
    // 전체 공지사항 수 (몇 개의 공지사항이n 있는지)
    const totalCount = noticeData.length;
    // 한 페이지에 보여줄 공지사항 수 (여기서는 8개씩 보여줌)
    const limit = 8;
    // 현재 페이지 (페이지와 데이터 바인딩의 핵심 flag)
    let currentPage = 1;
    // 전체 페이지 수 계산 (공지사항을 몇 페이지로 나눌 수 있는지)
    let totalPage = Math.ceil(totalCount / limit);
    // 보여줄 페이지 개수
    const pageCount = totalCount > 40 ? 5 : totalPage;
    // 현재 페이지의 그룹
    let pageGroup = Math.ceil(currentPage / pageCount);
    // 마지막 페이지 (한 화면에 나타낼 페이지 그룹 x 현재 페이지 그룹)
    let lastPage = pageGroup * pageCount;
    // 첫 페이지
    let firstPage = lastPage - (pageCount - 1);

    function createAnnouncementSection() {
      if (isAnnouncementSectionCreated) return;
      // 공지사항을 감싸는 전체 컨테이너를 생성
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

      // 생성한 공지사항 UI를 body에 추가
      document.body.append(container);
      isAnnouncementSectionCreated = true;
    }
    createAnnouncementSection(); // 공지사항 UI를 생성

    // 쿼리스트링 가져오는 변수
    const urlParams = new URLSearchParams(window.location.search);
    // 초기 페이지 번호 설정하는 변수
    const initialPage = urlParams.get('page')
      ? Number(urlParams.get('page'))
      : 1;
    currentPage = initialPage;

    // history 업데이트
    function updateHistory(pageNumber, searchTerm = '') {
      const newQuery = `?page=${pageNumber}${searchTerm ? `&search=${searchTerm}` : ''}`;
      history.pushState({ page: pageNumber, search: searchTerm }, '', newQuery);
    }
    //앞으로가기 뒤로가기 해주는 함수.
    window.addEventListener('popstate', event => {
      if (event.state && event.state.page) {
        currentPage = event.state.page;
        const searchTerm = event.state.search || '';
        updatePagination(
          searchTerm
            ? noticeData.filter(post =>
                post.title.toLowerCase().includes(searchTerm),
              )
            : noticeData,
        );
      }
    });

    const page = document.querySelector('.paging-list');

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
      const prevBtn = document.querySelector('.paging-item.prev button');
      prevBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage -= 1;
          updateHistory(currentPage);
          updatePagination();
        }
      });

      const nextBtn = document.querySelector('.paging-item.next button');
      nextBtn?.addEventListener('click', () => {
        if (currentPage < totalPage) {
          currentPage += 1;
          updateHistory(currentPage);
          updatePagination();
        }
      });

      const pageItems = document.querySelectorAll('.paging-item a');
      pageItems.forEach(cur => {
        cur.addEventListener('click', event => {
          const selectedPage = Number(event.target.textContent);
          currentPage = selectedPage;
          updateHistory(currentPage);
          updatePagination();
        });
      });
    }

    const postContainer = document.querySelector('.postcard-container');

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

      function cuttingString(text, limit) {
        if (text.length > limit) {
          return text.slice(0, limit) + '...';
        }
        return text;
      }

      currentPosts.forEach(post => {
        const postHTML = `
        <div class="postcard">
          <img class="postcard-img" src="${post.image}" alt="Post Image"/>
          <div class="contents">
            <h2 class="contents__title">${cuttingString(post.title, 20)}</h2>
            <p class="contents__content">${cuttingString(post.contents, 30)}</p>
            <div class="contents__information">
              <span class="information-author">${cuttingString(post.author, 10)}</span>
              <span class="information-date">${cuttingString(post.writedAt, 15)}</span>
            </div>
          </div>
        </div>
      `;
        postContainer.insertAdjacentHTML('beforeend', postHTML);
      });
    }

    // 검색기능을 위한 변수
    const searchInput = document.querySelector('input[type="search"]');
    const searchButton = document.querySelector('.material-symbols-outlined');

    // 검색 버튼과 엔터 키 이벤트
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') handleSearch();
    });
    searchButton.addEventListener('click', handleSearch);

    // 검색기능 함수
    function handleSearch() {
      const searchTerm = searchInput.value.trim().toLowerCase();
      const filteredData = noticeData.filter(post =>
        post.title.toLowerCase().includes(searchTerm),
      );

      let textStyle = '';
      currentPage = 1;
      document.querySelector('.helper-text')?.remove();

      textStyle = filteredData.length === 0 ? 'text-error' : 'text-success';
      postContainer.insertAdjacentHTML(
        'beforebegin',
        `<p class="helper-text">검색결과 <span class="${textStyle}">${filteredData.length}개</span>의 게시물</p>`,
      );
      updateHistory(currentPage, searchTerm);
      updatePagination(filteredData);
    }

    function updatePagination(data = noticeData) {
      totalPage = Math.ceil(data.length / limit);
      pageGroup = Math.ceil(currentPage / pageCount);
      lastPage = pageGroup * pageCount;
      firstPage = lastPage - (pageCount - 1);

      if (totalPage === 0) currentPage = 1;
      else if (currentPage > totalPage) currentPage = totalPage;

      if (lastPage > totalPage) lastPage = totalPage;

      pageRendering();
      renderPosts(data);
    }

    pageRendering(); // 처음에 페이지 버튼들을 그림
    renderPosts(); // 첫 번째 페이지의 공지사항을 그림
  }
  pagination();
}
