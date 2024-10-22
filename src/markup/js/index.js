// 실시간 시간 구하기
let nowTime;
const getTime = () => {
  nowTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
}
getTime();
setInterval(getTime, 1000);

const timeEl = document.querySelectorAll('.time-now');
timeEl.forEach((e) => {
  e.textContent = nowTime;
});

// swiper
const mainNoticeSwiper = new Swiper('.main-notice .swiper', {
  slidesPerView: 2,
  spaceBetween: 20,
  navigation: {
    nextEl: '.main-notice .swiper-button-next',
    prevEl: '.main-notice .swiper-button-prev',
  },
});

// 근무 시작/종료 모달 열기
const workStateBtn = document.getElementById('btn-work-state');
workStateBtn.addEventListener('click', async(e) => {
  const popupId = e.currentTarget.getAttribute('data-popup');
  const popupEl = document.getElementById(popupId);

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

  if(true) {
    popupEl.querySelector('.text').textContent = '근무를 시작하시겠습니까?';
  } else {
    popupEl.querySelector('.text').textContent = '근무를 종료하시겠습니까?';
  }
  
  openPopup(popupId);
});

// 근무 시작/종료 확인 버튼 동작
const workConfirmBtn = document.getElementById('confirmWorkBtn');
workConfirmBtn.addEventListener('click', async(e) => {

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

  const popupId = e.currentTarget.closest('.layer-popup').getAttribute('id');
  closePopup(popupId);
});