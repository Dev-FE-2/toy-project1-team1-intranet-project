import 'material-symbols';
import { fetchCollectionData } from '../../../utils/fetchCollectionData';
let isAnnouncementSectionCreated = false;
export default async function Announcement() {
  const noticeData = await fetchCollectionData('notices');

  // 페이지네이션을 처리하는 함수
  function pagination() {
    // 전체 공지사항 수 (몇 개의 공지사항이 있는지)
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

    // 공지사항 UI를 동적으로 생성하는 함수
    function createAnnouncementSection() {
      if (isAnnouncementSectionCreated) return;
      // 공지사항을 감싸는 전체 컨테이너를 생성
      const container = document.createElement('div');
      container.classList.add('container', 'announcement');

      // 공지사항 UI 구조를 HTML로 작성하여 추가
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

    const page = document.querySelector('.paging-list');

    // 페이지네이션 UI를 그리는 함수 (페이지 번호와 이전/다음 버튼)
    function pageRendering() {
      page.innerHTML = '';

      if (pageGroup > 1) {
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
      function cuttingString(text, limit) {
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
              <span class="information-date">${cuttingString(post.writedAt, 15)}</span>
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
          history.pushState(
            null,
            null,
            `/Announcement?${urlParams.toString()}`,
          );
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
      currentPage = 1;
      document.querySelector('.helper-text')?.remove();

      if (filteredData.length === 0) {
        textStyle = 'text-error';
      } else {
        textStyle = 'text-success';
      }
      postContainer.insertAdjacentHTML(
        'beforebegin',
        `<p class="helper-text">검색결과 <span class="${textStyle}">${filteredData.length}개</span>의 게시물</p>`,
      );

      updatePagination(filteredData); // 페이지네이션 업데이트
      renderPosts(filteredData); // 필터링된 데이터로 포스트 렌더링
    }

    // 페이지네이션을 업데이트하고 공지사항 목록을 다시 렌더링하는 함수
    function updatePagination(data = noticeData) {
      totalPage = Math.ceil(data.length / limit);
      pageGroup = Math.ceil(currentPage / pageCount);
      lastPage = pageGroup * pageCount;
      firstPage = lastPage - (pageCount - 1);

      if (totalPage === 0) currentPage = 1;
      else if (currentPage > totalPage) currentPage = totalPage;

      if (lastPage > totalPage) lastPage = totalPage;

      pageRendering(); // 페이지네이션 UI 다시 그리기
      renderPosts(data); // 필터링된 데이터로 포스트 렌더링
    }
    // 페이지네이션 실행 및 공지사항 렌더링
    pageRendering(); // 처음에 페이지 버튼들을 그림
    updatePagination(initialSearch, false); // 초기 렌더링 시 필터링과 히스토리 업데이트 방지
  }
  pagination();
  async function renderNoticeDetail(postId) {
    container.innerHTML = '';
    const specificNotice = noticeData.find(post => post.id === postId);
    if (!specificNotice) return;
    const detailContainer = document.createElement('div');
    detailContainer.classList.add('add-notice-wrapper');
    detailContainer.innerHTML = `
    <div class="add-notice-content">
      <h2>공지사항 상세 조회</h2>
      <div class="content-img">
        <img class="img-preview" src="${specificNotice.image}" alt="기본공지사항이미지" />
      </div>
      <div class="content-contents">
        <div class="content-title">
          <input type="text" value="${specificNotice.title}" readonly />
          <span class="title-secondary">
            <input type="text" value="${specificNotice.author}" readonly />
            <input type="text" value="${specificNotice.writedAt}" readonly />
          </span>
        </div>
      </div>
      <textarea name="" id="" readonly>${specificNotice.contents}</textarea>
    </div>
    <div class="button-box">
      <button class="btn btn-outline close--btn">닫기</button>
    </div>
  `;
    const closeButton = detailContainer.querySelector('.close--btn');
    closeButton.addEventListener('click', () => {
      detailContainer.remove();
    });
    container.appendChild(detailContainer);
  }
  return container;
}
