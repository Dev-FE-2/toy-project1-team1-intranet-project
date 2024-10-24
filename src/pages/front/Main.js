import './main.css';
import Modal from '/src/components/Modal/Modal';
import Swiper from 'swiper';
import 'swiper/css';

export default function Main(container) {
  // 실시간 시간 구하기
  const today = new Date();
  let nowTime;
  const getTime = () => {
    nowTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
  };
  getTime();
  setInterval(getTime, 1000);

  // 모달
  const workConfirmModal = new Modal({
    classList: 'test-class',
    id: 'confirmWork',
    content: `
      <div>
        <span>현재 시간</span>
        <span class="time-now">${nowTime}</span>
      </div>
      <p class="text">근무를 시작하시겠습니까?</p>
    `,
    buttons: `
      <button type="button" id="confirmWorkBtn" class="btn btn-solid confirm-popup-btn">확인</button>
      <button type="button" id="cancelWorkBtn" class="btn btn-outline close-popup-btn">취소</button>
    `,
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
              <div class="swiper-slide postcard empty"></div>
              <div class="swiper-slide postcard empty"></div>
            </div>
          </div>
          <div class="swiper-button-prev"></div>
          <div class="swiper-button-next"></div>
        </div>
      </div>
    </main>
    ${workConfirmModal.render()}
  `;
  container.innerHTML = mainHtml;

  // 공지사항 목록 추가하기
  let noticeData = [];
  const fetchNoticeData = async () => {
    try {
      const response = await fetch('/api/notice');
      const json = await response.json();
      noticeData = json.data;

      if (noticeData.length > 0) {
        const postCont = document.querySelector('.postcard-container');
        postCont.innerHTML = '';
        noticeData.map(data => {
          const card = `
            <div class="swiper-slide postcard">
              <a href="#none">
                <img class="postcard-img" src="${data.thumb}" alt="Post Image" />
                <div class="contents">
                  <h2 class="contents__title">${data.title}</h2>
                  <p class="contents__content">${data.content}</p>
                  <div class="contents__information">
                    <span class="information-author">${data.writer}</span>
                    <span class="information-date">${data.creatat}</span>
                  </div>
                </div>
              </a>
            </div>
          `;
          postCont.insertAdjacentHTML('beforeend', card);
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
  fetchNoticeData();

  // swiper
  const mainNoticeSwiper = new Swiper('.main-notice .swiper', {
    slidesPerView: 1.2,
    spaceBetween: 20,
    navigation: {
      nextEl: '.main-notice .swiper-button-next',
      prevEl: '.main-notice .swiper-button-prev',
    },
    breakpoints: {
      769: {
        slidesPerView: 2,
      },
    },
  });

  // 모달 열기/닫기 버튼 클릭
  document.getElementById('btn-work-state').addEventListener('click', () => {
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
    workConfirmModal.open();
  });
  document.getElementById('cancelWorkBtn').addEventListener('click', () => {
    workConfirmModal.close();
  });

  // 모달 확인 버튼
  document.getElementById('confirmWorkBtn').addEventListener('click', () => {
    // 근무 상태 보내기
    // try {
    //   const res = await fetch('', { // 근무 상태 관련 api url
    //     method: "POST"
    //   });
    //   const result = await res.json();
    //   if(true){}else{}
    // } catch (err) {
    //   console.error(err)
    // }

    workConfirmModal.close();
  });
}
