import 'material-symbols';
import { fetchCollectionData } from '../../../utils/fetchCollectionData';

export default async function Announcement() {
  const noticeData = await fetchCollectionData('notices');
  let queryParams = new URLSearchParams(window.location.search);

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
  let currentPage = parseInt(queryParams.get('page')) || 1;
  function pagination() {
    const totalCount = noticeData.length;
    const limit = 8;

    let totalPage = Math.ceil(totalCount / limit);
    const pageCount = totalCount > 40 ? 5 : totalPage;
    let pageGroup = Math.ceil(currentPage / pageCount);
    let lastPage = pageGroup * pageCount;
    let firstPage = lastPage - (pageCount - 1);

    const page = container.querySelector('.paging-list');

    function pageRendering() {
      page.innerHTML = '';

      if (currentPage) {
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

      if (currentPage) {
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
          updatePagination();
          queryParams.set('page', currentPage);
          history.pushState(null, null, `?${queryParams.toString()}`);
        }
      });

      const nextBtn = container.querySelector('.paging-item.next button');
      nextBtn?.addEventListener('click', () => {
        if (currentPage < totalPage) {
          currentPage += 1;
          updatePagination();
          queryParams.set('page', currentPage);
          history.pushState(null, null, `?${queryParams.toString()}`);
        }
      });

      const pageItems = container.querySelectorAll('.paging-item a');
      pageItems.forEach(cur => {
        cur.addEventListener('click', event => {
          const selectedPage = Number(event.target.textContent);
          currentPage = selectedPage;
          updatePagination();
          queryParams.set('page', currentPage);
          history.pushState(null, null, `?${queryParams.toString()}`);
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
      const currentPosts = posts.slice(start, end);

      function cuttingString(text = '', limit) {
        if (text.length > limit) {
          return text.slice(0, limit) + '...';
        }
        return text; // text가 undefined일 때 빈 문자열로 반환
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

          renderNoticeDetail(postId);
        });
      });
    }

    const searchInput = container.querySelector('input[type="search"]');
    const searchButton = container.querySelector('.material-symbols-outlined');

    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') handleSearch();
    });
    searchButton.addEventListener('click', handleSearch);

    function handleSearch(queryOnly = false) {
      const searchInputText = searchInput.value.trim().toLowerCase();
      const searchTerm = queryOnly
        ? queryParams.get('search') || ''
        : searchInputText;
      const filteredData = noticeData.filter(post =>
        post.title.toLowerCase().includes(searchTerm),
      );

      let textStyle = '';
      currentPage = 1;
      container.querySelector('.helper-text')?.remove();

      if (filteredData.length === 0) {
        textStyle = 'text-error';
      } else {
        textStyle = 'text-success';
      }
      postContainer.insertAdjacentHTML(
        'beforebegin',
        `<p class="helper-text">검색결과 <span class="${textStyle}">${filteredData.length}개</span>의 게시물</p>`,
      );

      if (!searchInputText) searchInput.value = searchTerm;
      queryParams.set('search', searchTerm);
      queryParams.set('page', currentPage);
      history.pushState(null, null, `?${queryParams.toString()}`);

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

    pageRendering();
    renderPosts();
    handleSearch(true);
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
          <div class="title-secondary">
              <div class="secondary-component">${specificNotice.author}</div>
              <div class="secondary-component">${specificNotice.updateAt ? specificNotice.updateAt : specificNotice.writedAt}</div>
          </div>
        </div>
      </div>
      <div class="content-content" name="" id="">${specificNotice.contents}</div>
    </div>
    <div class="button-box">
      <button class="btn btn-outline close--btn">닫기</button>
    </div>
  `;

    // const closeButton = detailContainer.querySelector('.close--btn');

    container.prepend(detailContainer);
  }

  return container;
}
