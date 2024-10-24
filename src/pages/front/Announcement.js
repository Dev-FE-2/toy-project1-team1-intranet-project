export default function Announcement() {
  const rootEl = document.createElement('div');
  rootEl.innerHTML = `
        <div class="container announcement">
        <div class="container__flex title">
          <h1 class="title">공지사항</h1>
          <div class="announcement__search-box">
            <input type="search"s placeholder="검색어를 입력하세요" />
            <span class="material-symbols-outlined"> search </span>
          </div>
        </div>

        <!-- 포스트카드 -->
        <ul class="postcard-container">
          
        </ul>
        <!-- 페이지네이션 -->
        <div class="pagination">
          <ul class="paging-list" role="list">
            <li class="paging-item prev">
              <button type="button" aria-label="이전 페이지">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 34 34"
                >
                  <line
                    x1="20"
                    y1="6"
                    x2="12"
                    y2="17"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  ></line>
                  <line
                    x1="12"
                    y1="17"
                    x2="20"
                    y2="28"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  ></line>
                </svg>
              </button>
            </li>
            <!-- [D] 활성화된 li.is-active 클래스 추가 -->
            <li class="paging-item is-active" aria-current="page">
              <a href="javascript:void(0);">1</a>
            </li>
            <li class="paging-item"><a href="javascript:void(0);">2</a></li>
            <li class="paging-item"><a href="javascript:void(0);">3</a></li>
            <li class="paging-item"><a href="javascript:void(0);">4</a></li>
            <li class="paging-item"><a href="javascript:void(0);">5</a></li>
            <li class="paging-item next">
              <button type="button" aria-label="다음 페이지">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 34 34"
                >
                  <line
                    x1="14"
                    y1="6"
                    x2="22"
                    y2="17"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  ></line>
                  <line
                    x1="22"
                    y1="17"
                    x2="14"
                    y2="28"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  ></line>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
  `;

  // 바인딩할 데이터들.
  const posts = [
    {
      img: './img/begin-again-5.webp',
      title: '첫 번째 공지',
      content: '첫 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '두 번째 공지',
      content: '두 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '세 번째 공지',
      content: '세 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '네 번째 공지',
      content: '네 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '다섯 번째 공지',
      content: '다섯 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '여섯 번째 공지',
      content: '여섯 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '일곱 번째 공지',
      content: '일곱 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '여덟 번째 공지',
      content: '여덟 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '아홉 번째 공지',
      content: '아홉 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '열 번째 공지',
      content: '아홉 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '첫 번째 공지',
      content: '아홉 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '두 번째 공지',
      content: '아홉 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '세 번째 공지',
      content: '아홉 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '네 번째 공지',
      content: '아홉 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '다섯 번째 공지',
      content: '아홉 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
    {
      img: './img/begin-again-5.webp',
      title: '여섯 번째 공지',
      content: '아홉 번째 공지사항 내용입니다.',
      author: '영훈',
      date: '2024-10-18',
    },
  ];

  // 페이지네이션 변수목록 (총데이터수, 한페이지당 보여줄 데이터, 한화면에 나타낼 페이지 그룹 필요 )

  const totalCount = posts.length; // 데이터 개수 => 이건 배열.length로 하면 됨.
  const limit = 5; // 한 페이지당 보여줄 데이터 => 이건 8개씩 보여줄꺼니까 ㄱㅊ
  let currentPage = 1; // 현재 페이지
  const pageCount = 3; // 한 화면에 나타낼 페이지 그룹 (고정값) => 123=>그룹1 456=>그룹2로 이해

  const totalPage = Math.ceil(totalCount / limit); // 총 페이지 수
  let pageGroup = Math.ceil(currentPage / pageCount); // 현재 페이지의 그룹

  let lastPage = pageGroup * pageCount; // 마지막 페이지 (한 화면에 나타낼 페이지 그룹 x 현재 페이지 그룹)
  let firstPage = lastPage - (pageCount - 1); // 첫번째 페이지
  // const next = lastPage + 1;
  // const prev = firstPage - 1;

  const page = rootEl.querySelector('.paging-list');

  // 페이지네이션 그리기
  // 데이터 갱신
  function updatePagination() {
    pageGroup = Math.ceil(currentPage / pageCount);
    lastPage = pageGroup * pageCount;
    firstPage = lastPage - (pageCount - 1);
    // 3을누르면 여전히 페이지 그룹은 123임. 그걸 올려주는게 아래 코드임.
    // 아래 코드로 인하여 3을 눌렀을때 첫번째 페이지는 2, 마지막 페이지는4가됨.
    // 근데 문제는 마지막 페이지 4를 눌렀을때, 345가 되어버리고, 맨 마지막 코드에 의해 5페이지는 사라져 3,4 페이지 두 개만 남게 됨.
    // 그럼 어떻게 234가 되게 할 수 있을까?
    // 만약 현재 페이지가 totalPage와 같아졌을때, lastPage=totalPage로 만들고, firstPage= lastPage-(pagecount-1)을 다시?=> 성공!!
    const nextGroup = currentPage === lastPage;
    const prevGroup = currentPage === firstPage;

    if (nextGroup) {
      lastPage += 1;
      firstPage += 1;
    }

    if (prevGroup && currentPage > 1) {
      lastPage -= 1;
      firstPage -= 1;
    }

    if (currentPage === totalPage) {
      lastPage = totalPage;
      firstPage = lastPage - (pageCount - 1);
    }

    if (lastPage > totalPage) {
      lastPage = totalPage;
    } // 마지막페이지가 전체 페이지를 초과하지 않게 함. 가령 이 코드없으면 데이터가 2페이지에서 끝나는데, 3페이지가 생겨버림

    // 페이지네이션 다시 그리기
    pageRendering();

    // 현재 페이지에 맞는 카드 렌더링
    renderPosts();
  }

  // 페이지 버튼을 통한 currentPage 조작 및 페이지 그룹 업데이트하기
  function attachEvent() {
    const prevBtn = rootEl.querySelector('.paging-item.prev button');

    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
      }
      updatePagination();
    });

    const nextBtn = rootEl.querySelector('.paging-item.next button');

    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPage) {
        currentPage += 1;
      }
      updatePagination();
    });

    const pageItems = rootEl.querySelectorAll('.paging-item a');
    pageItems.forEach(cur => {
      cur.addEventListener('click', event => {
        const selectedPage = Number(event.target.textContent);
        currentPage = selectedPage;
        updatePagination();
      });
    });
  }

  function pageRendering() {
    page.innerHTML = '';

    page.insertAdjacentHTML(
      'beforeend',
      ` <li class="paging-item prev">
                <button type="button" aria-label="이전 페이지">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 34 34"
                  >
                    <line
                      x1="20"
                      y1="6"
                      x2="12"
                      y2="17"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    ></line>
                    <line
                      x1="12"
                      y1="17"
                      x2="20"
                      y2="28"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    ></line>
                  </svg>
                </button>
              </li>`,
    );

    for (let i = firstPage; i <= lastPage; i += 1) {
      const activeClass = i === currentPage ? 'is-active' : '';
      const html = `<li class="paging-item ${activeClass}"><a href="javascript:void(0);">${i}</a></li>`;
      page.insertAdjacentHTML('beforeend', html);
    }

    page.insertAdjacentHTML(
      'beforeend',
      ` <li class="paging-item next">
                <button type="button" aria-label="다음 페이지">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 34 34"
                  >
                    <line
                      x1="14"
                      y1="6"
                      x2="22"
                      y2="17"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    ></line>
                    <line
                      x1="22"
                      y1="17"
                      x2="14"
                      y2="28"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    ></line>
                  </svg>
                </button>
              </li>`,
    );
    attachEvent();
  }

  // 데이터 바인딩
  function renderPosts() {
    const postContainer = rootEl.querySelector('.postcard-container');
    postContainer.innerHTML = '';

    const start = (currentPage - 1) * limit;
    const end = start + limit;
    const currentPosts = posts.slice(start, end);

    // 현재 페이지 데이터로 카드 렌더링
    currentPosts.forEach(post => {
      const postHTML = `
      <div class="postcard">
        <img class="postcard-img" src="${post.img}" alt="Post Image"/>
        <div class="contents">
          <h2 class="contents__title">${post.title}</h2>
          <p class="contents__content">${post.content}</p>
          <div class="contents__information">
            <span class="information-author">${post.author}</span>
            <span class="information-date">${post.date}</span>
          </div>
        </div>
      </div>
    `;
      postContainer.insertAdjacentHTML('beforeend', postHTML);
    });
  }

  // 페이지네이션실행
  pageRendering();
  renderPosts();

  return rootEl;
}
