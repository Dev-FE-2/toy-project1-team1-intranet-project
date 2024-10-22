import './main.css';
import Modal from '/src/components/Modal/Modal';

export default function Main(cont) {
  // 실시간 시간 구하기
  const today = new Date();
  let nowTime;
  const getTime = () => {
    nowTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
  }
  getTime();
  setInterval(getTime, 1000);

  // 모달
  const workConfirmModal = new Modal({
    classList: 'test-class',
    id: 'confirmWork',
    title: '모달 제목~',
    content: `
      <div>
        <span>현재 시간</span>
        <span class="time-now">00:00</span>
      </div>
      <p class="text">근무를 시작하시겠습니까?</p>
    `,
    buttons: `
      <button type="button" id="confirmWorkBtn" class="btn btn-solid confirm-popup-btn">확인</button>
      <button type="button" class="btn btn-outline close-popup-btn">취소</button>
    `
  });

  const mainHtml = `
    <main class="container" data-page="main">
      <h1 class="title">내 정보</h1>
      <div class="my-info container-inner">
        <div class="my-info-inner">
          <div class="profile">
            <div class="img-box">
              <img src="https://cdn.pixabay.com/photo/2021/12/16/09/26/pomeranian-6874257_1280.jpg" alt="프로필 이미지">
            </div>
            <span class="name">홍길동</span>
            <p>
              <span class="team">개발팀</span> / <span class="position">사원</span>
            </p>
          </div>
          <div class="work-info">
            <div class="work-state">
              <div>
                <span class="work-state-title">현재 시간</span>
                <span class="work-state-content">${nowTime}</span>
              </div>
              <div>
                <span class="work-state-title">근무 상태</span>
                <span class="work-state-content">근무 전</span>
              </div>
            </div>
            <button
              type="button"
              id="btn-work-state"
              class="btn btn-solid btn-work-state"
              data-popup="confirmWork"
            >
              근무 시작
            </button>
          </div>
        </div>
      </div>
      <h2 class="title">공지사항</h2>
      <div class="main-notice container-inner">
        <div class="inner">
          <div class="swiper">
            <div class="swiper-wrapper postcard-container">
              <div class="swiper-slide postcard">
                <a href="#none">
                  <img class="postcard-img" src="./img/begin-again-5.webp" alt="Post Image" />
                  <div class="contents">
                    <h2 class="contents__title">타이틀</h2>
                    <p class="contents__content">이것은 공지사항입니다.</p>
                    <div class="contents__information">
                      <span class="information-author">전영훈</span>
                      <span class="information-date">2024-10-20</span>
                    </div>
                  </div>
                </a>
              </div>
              <div class="swiper-slide postcard">
                <a href="#none">
                  <img class="postcard-img" src="./img/begin-again-5.webp" alt="Post Image" />
                  <div class="contents">
                    <h2 class="contents__title">타이틀</h2>
                    <p class="contents__content">이것은 공지사항입니다.</p>
                    <div class="contents__information">
                      <span class="information-author">전영훈</span>
                      <span class="information-date">2024-10-20</span>
                    </div>
                  </div>
                </a>
              </div>
              <div class="swiper-slide postcard">
                <a href="#none">
                  <img class="postcard-img" src="./img/begin-again-5.webp" alt="Post Image" />
                  <div class="contents">
                    <h2 class="contents__title">타이틀</h2>
                    <p class="contents__content">이것은 공지사항입니다.</p>
                    <div class="contents__information">
                      <span class="information-author">전영훈</span>
                      <span class="information-date">2024-10-20</span>
                    </div>
                  </div>
                </a>
              </div>
              <div class="swiper-slide postcard">
                <a href="#none">
                  <img class="postcard-img" src="./img/begin-again-5.webp" alt="Post Image" />
                  <div class="contents">
                    <h2 class="contents__title">타이틀</h2>
                    <p class="contents__content">이것은 공지사항입니다.</p>
                    <div class="contents__information">
                      <span class="information-author">전영훈</span>
                      <span class="information-date">2024-10-20</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div class="swiper-button-prev"></div>
          <div class="swiper-button-next"></div>
        </div>
      </div>
    </main>
  `;

  cont.innerHTML = `
    ${mainHtml}
    ${workConfirmModal.render()}
  `;

  // 근무 시작/종료 모달 열기
  const workStateBtn = document.getElementById('btn-work-state');
  workStateBtn.addEventListener('click', async() => {
    // 현재 근무 상태 받아오기
    // try {
    //   const res = await fetch('', { // 근무 상태 관련 api url
    //     method: "GET"
    //   });
    //   const result = await res.json();
    //   if(true){}else{}
    // } catch (err) {
    //   console.error(err)
    // }

    // if(true) {
    //   popupEl.querySelector('.text').textContent = '근무를 시작하시겠습니까?';
    // } else {
    //   popupEl.querySelector('.text').textContent = '근무를 종료하시겠습니까?';
    // }

    workConfirmModal.open();
  });
}







{/* <div class="dimmed" id="dimmed"></div>
<div class="layer-popup confirm-work-popup" id="confirmWork">
  <div>
    <span>현재 시간</span>
    <span>${nowTime}</span>
  </div>
  <p class="text">근무를 시작하시겠습니까?</p>
  <div class="btn-box">
    <button type="button" id="confirmWorkBtn" class="btn btn-solid confirm-popup-btn">확인</button>
    <button type="button" class="btn btn-outline close-popup-btn">취소</button>
  </div>
</div> */}