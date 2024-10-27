import 'material-symbols';

export default function Announcement() {
  // 공지사항 데이터를 저장할 배열
  let noticeData = [];

  // 공지사항 데이터를 API에서 가져오는 함수
  const fetchNoticeData = async () => {
    try {
      // API 요청을 보내서 공지사항 데이터를 받아옴
      const response = await fetch('/api/notice');
      const json = await response.json(); // 받은 데이터를 JSON 형식으로 변환
      noticeData = json.data; // 받은 데이터를 noticeData 배열에 저장

      // 데이터가 성공적으로 로드되면 페이지네이션을 실행
      if (noticeData.length > 0) {
        pagination();
      }
    } catch (err) {
      // 데이터 가져오기에 실패하면 오류를 콘솔에 출력
      console.error(err);
    }
  };

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
      <ul class="postcard-container"></ul>
      <div class="pagination">
        <ul class="paging-list" role="list"></ul>
      </div>
    `;

      // 생성한 공지사항 UI를 body에 추가
      document.body.append(container);
    }
    createAnnouncementSection(); // 공지사항 UI를 생성

    const page = document.querySelector('.paging-list');

    // 페이지네이션 UI를 그리는 함수 (페이지 번호와 이전/다음 버튼)
    function pageRendering() {
      // 이전에 있던 페이지 번호 및 버튼을 초기화
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
      // 전체 페이지 수만큼 페이지 번호를 그려줌
      for (let i = firstPage; i <= lastPage; i += 1) {
        // 현재 페이지는 활성화 상태로 표시
        const activeClass = i === currentPage ? 'is-active' : '';
        // 각 페이지 번호 버튼을 추가
        page.insertAdjacentHTML(
          'beforeend',
          `<li class="paging-item ${activeClass}"><a href="javascript:void(0);">${i}</a></li>`,
        );
      }

      // 다음 버튼 추가 (다음 버튼도 항상 표시됨)
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

      // 페이지 버튼에 이벤트를 연결하는 함수 실행
      attachEvent();
    }

    // 페이지 버튼과 이전/다음 버튼 클릭 이벤트를 처리하는 함수
    function attachEvent() {
      // 이전 버튼을 클릭했을 때, 현재 페이지를 1 감소시키고 페이지를 업데이트
      const prevBtn = document.querySelector('.paging-item.prev button');
      prevBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage -= 1; // 페이지 감소
          updatePagination(); // 페이지 업데이트
        }
      });

      // 다음 버튼을 클릭했을 때, 현재 페이지를 1 증가시키고 페이지를 업데이트
      const nextBtn = document.querySelector('.paging-item.next button');
      nextBtn?.addEventListener('click', () => {
        if (currentPage < totalPage) {
          currentPage += 1; // 페이지 증가
          updatePagination(); // 페이지 업데이트
        }
      });

      // 각 페이지 번호를 클릭했을 때 해당 페이지로 이동
      const pageItems = document.querySelectorAll('.paging-item a');
      pageItems.forEach(cur => {
        cur.addEventListener('click', event => {
          const selectedPage = Number(event.target.textContent); // 클릭한 페이지 번호 가져옴
          currentPage = selectedPage; // 클릭한 페이지로 현재 페이지 설정
          updatePagination(); // 페이지 업데이트
        });
      });
    }

    // 공지사항 카드를 렌더링할 위치를 찾음
    const postContainer = document.querySelector('.postcard-container');
    // 공지사항 카드를 화면에 렌더링하는 함수
    function renderPosts(posts = noticeData) {
      postContainer.innerHTML = ''; // 기존 공지사항을 초기화

      // 현재 페이지에 맞는 공지사항을 계산
      const start = (currentPage - 1) * limit;
      const end = start + limit;
      const currentPosts = posts.slice(start, end); // 현재 페이지에 해당하는 공지사항만 잘라서 가져옴

      // 각 공지사항을 카드 형식으로 렌더링
      currentPosts.forEach(post => {
        const postHTML = `
        <div class="postcard">
          <img class="postcard-img" src="${post.thumb}" alt="Post Image"/>
          <div class="contents">
            <h2 class="contents__title">${post.title}</h2>
            <p class="contents__content">${post.content}</p>
            <div class="contents__information">
              <span class="information-author">${post.writer}</span>
              <span class="information-date">${post.creatat}</span>
            </div>
          </div>
        </div>
      `;
        postContainer.insertAdjacentHTML('beforeend', postHTML); // 새로운 공지사항을 추가
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
      currentPage = 1;

      if (filteredData.length === 0) {
        postContainer.innerHTML = '';
        postContainer.innerHTML = `
         <section class="postcard-container no-result">
        <p>찾으시는 검색결과가 없습니다.</p>
      </section>`;
      } else {
        updatePagination(filteredData);
        renderPosts(filteredData);
      }
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
      renderPosts(); // 공지사항 목록 다시 그리기
    }

    // 페이지네이션 실행 및 공지사항 렌더링
    pageRendering(); // 처음에 페이지 버튼들을 그림
    renderPosts(); // 첫 번째 페이지의 공지사항을 그림
  }

  fetchNoticeData(); // 공지사항 데이터를 가져오고 페이지네이션을 실행
}
