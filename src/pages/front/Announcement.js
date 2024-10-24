export default function Announcement() {
  return `
        <div class="container announcement">
        <div class="container__flex title">
          <h1 class="title">공지사항</h1>
          <div class="announcement__search-box">
            <input type="search" placeholder="검색어를 입력하세요" />
            <span class="material-symbols-outlined"> search </span>
          </div>
        </div>

        <!-- 포스트카드 -->
        <ul class="postcard-container">
          <li class="postcard">
            <img
              class="postcard-img"
              src="./img/begin-again-5.webp"
              alt="Post Image"
            />
            <div class="contents">
              <h2 class="contents__title">타이틀</h2>
              <p class="contents__content">이것은 공지사항입니다.</p>
              <div class="contents__information">
                <span class="information-author">전영훈</span>
                <span class="information-date">2024-10-20</span>
              </div>
            </div>
          </li>
          <li class="postcard">
            <img
              class="postcard-img"
              src="./img/begin-again-5.webp"
              alt="Post Image"
            />
            <div class="contents">
              <h2 class="contents__title">타이틀</h2>
              <p class="contents__content">이것은 공지사항입니다.</p>
              <div class="contents__information">
                <span class="information-author">전영훈</span>
                <span class="information-date">2024-10-20</span>
              </div>
            </div>
          </li>
          <li class="postcard">
            <img
              class="postcard-img"
              src="./img/begin-again-5.webp"
              alt="Post Image"
            />
            <div class="contents">
              <h2 class="contents__title">타이틀</h2>
              <p class="contents__content">이것은 공지사항입니다.</p>
              <div class="contents__information">
                <span class="information-author">전영훈</span>
                <span class="information-date">2024-10-20</span>
              </div>
            </div>
          </li>
          <li class="postcard">
            <img
              class="postcard-img"
              src="./img/begin-again-5.webp"
              alt="Post Image"
            />
            <div class="contents">
              <h2 class="contents__title">타이틀</h2>
              <p class="contents__content">이것은 공지사항입니다.</p>
              <div class="contents__information">
                <span class="information-author">전영훈</span>
                <span class="information-date">2024-10-20</span>
              </div>
            </div>
          </li>
          <li class="postcard">
            <img
              class="postcard-img"
              src="./img/begin-again-5.webp"
              alt="Post Image"
            />
            <div class="contents">
              <h2 class="contents__title">타이틀</h2>
              <p class="contents__content">이것은 공지사항입니다.</p>
              <div class="contents__information">
                <span class="information-author">전영훈</span>
                <span class="information-date">2024-10-20</span>
              </div>
            </div>
          </li>
          <li class="postcard">
            <img
              class="postcard-img"
              src="./img/begin-again-5.webp"
              alt="Post Image"
            />
            <div class="contents">
              <h2 class="contents__title">타이틀</h2>
              <p class="contents__content">이것은 공지사항입니다.</p>
              <div class="contents__information">
                <span class="information-author">전영훈</span>
                <span class="information-date">2024-10-20</span>
              </div>
            </div>
          </li>
          <li class="postcard">
            <img
              class="postcard-img"
              src="./img/begin-again-5.webp"
              alt="Post Image"
            />
            <div class="contents">
              <h2 class="contents__title">타이틀</h2>
              <p class="contents__content">이것은 공지사항입니다.</p>
              <div class="contents__information">
                <span class="information-author">전영훈</span>
                <span class="information-date">2024-10-20</span>
              </div>
            </div>
          </li>
          <li class="postcard">
            <img
              class="postcard-img"
              src="./img/begin-again-5.webp"
              alt="Post Image"
            />
            <div class="contents">
              <h2 class="contents__title">타이틀</h2>
              <p class="contents__content">이것은 공지사항입니다.</p>
              <div class="contents__information">
                <span class="information-author">전영훈</span>
                <span class="information-date">2024-10-20</span>
              </div>
            </div>
          </li>
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
}
