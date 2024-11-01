import createButton from '@components/Button/Button';
import createModal from '/src/components/Modal/Modal';
import Swiper from 'swiper';
import 'swiper/css';
import createTitle from '@components/Title/Title';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, updateDoc } from 'firebase/firestore';
import { AUTH, DB } from '../../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchCurrentUserData } from '@utils/fetchCurrentUserData';
import createCard from '@components/Card/Card';
import cuttingString from '@utils/cuttingString';

export default async function Main(container) {

  // 실시간 시간 구하기
  const today = new Date();
  let nowTime;
  const getTime = () => {
    nowTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
  };
  getTime();
  setInterval(getTime, 1000);

  // 유저 프로필
  let userData;
  let userName;
  let userImgSrc;
  let userTeam;
  let userPosition;

  try {
    userData = await fetchCurrentUserData();

    // 유저 데이터(이름, 사진)
    userName = userData.name;
    userImgSrc = userData.profileImg;
    userTeam = userData.team;
    userPosition = userData.role;
  } catch (err) {
    console.error('err', err)
  }

  // '내 정보' 영역에서 필요한 값
  let isWorking = false;
  let workingStateText = '시작';
  let nowWorkingStateText = '근무 전';

  // 유저의 isWorking 상태를 가져옴
  const getIsWorking = async (userId) => {
    const userDocRef = doc(DB, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data().isWorking;
    }
    throw new Error('유저 문서가 존재하지 않습니다.')
  }

  // 페이지 접속 시 근무 상태에 따라 다른 텍스트를 보여주기 위함
  const setWorkStateButton = () => {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(AUTH, async (user) => {
        if (user) {
          try {
            isWorking = await getIsWorking(user.uid);
            workingStateText = isWorking ? '종료' : '시작';
            nowWorkingStateText = isWorking ? '근무 중' : '근무 전';
            resolve();  // Promise 해결
          } catch (err) {
            console.error('isWorking 값을 가져오는 중 오류 발생:', err);
            reject(err);  // Promise 거부
          }
        }
      });
    });
  };
  await setWorkStateButton();

  // 근무 상태 변경하는 함수
  const toggleIsWorking = async (userId) => {
    try {
      const isWorking = await getIsWorking(userId);
      const userDocRef = doc(DB, 'users', userId);
      await updateDoc(userDocRef, { isWorking: !isWorking });
      workingStateText = !isWorking ? '종료' : '시작';
      nowWorkingStateText = !isWorking ? '근무 중' : '근무 전';
      updateMyInfo();
      updateModal();
      if(isWorking){
        document.getElementById('btn-work-state').classList.remove('btn-selected');
        document.getElementById('btn-work-state').classList.add('btn-solid');
      }else{
        document.getElementById('btn-work-state').classList.add('btn-selected');
        document.getElementById('btn-work-state').classList.remove('btn-solid');
      }
    } catch (err) {
      console.error('isWorking 변경 중 오류 발생:', err);
    }
  };

  // 모달 내 근무시작 확인 버튼
  const workConfirmButton = createButton({
    classList: ['btn', 'btn-solid', 'confirm-popup-btn'],
    id: 'confirmWorkBtn',
    text: '확인',
    onClick: () => {
      // 근무 상태 보내기
      onAuthStateChanged(AUTH, async (user) => {
        if (user) {
          // 사용자가 로그인한 경우 uid를 사용하여 업데이트
          await toggleIsWorking(user.uid);
          workConfirmModal.close();
        }
      });
    }
  });

  // 모달
  const modalHtml = () => `
    <div class="modal-content-box">
      <div>
        <span>현재 시간</span>
        <span class="time-now">${nowTime}</span>
      </div>
      <p class="text working-state-text">근무를 ${workingStateText}하시겠습니까?</p>
    </div>
  `;
  const workConfirmModal = createModal({
    classList: ['test-class'],
    id: 'confirmWork',
    content: modalHtml(),
    buttons: `
      ${workConfirmButton.render()}
      <button type="button" id="cancelWorkBtn" class="btn btn-outline close-popup-btn">취소</button>
    `,
  });

  // 모달 리렌더링 관련
  const updateModal = () => {
    document.querySelector('#confirmWork .modal-content-box').innerHTML = modalHtml();
  
    // 모달 닫기 버튼 이벤트 다시 연결
    document.getElementById('cancelWorkBtn').addEventListener('click', () => {
      workConfirmModal.close();
    });
  
    // 모달 버튼 클릭 이벤트 다시 연결
    workConfirmButton.buttonClickEvent();
  };

  // 내정보 리렌더링 관련
  const updateMyInfo = () => {
    const myInfoHtml = `
      <div class="my-info-inner">
        <div class="profile">
          <div class="img-box">
            <img src="${userImgSrc}" alt="프로필 이미지">
          </div>
          <span class="name">${userName}</span>
          <p>
            <span class="team">${userTeam}</span> / <span class="position">${userPosition}</span>
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
              <span class="work-state-content now-working-state-text">${nowWorkingStateText}</span>
            </div>
          </div>
          <button
            type="button"
            id="btn-work-state"
            class="btn ${isWorking ? 'btn-selected' : 'btn-solid'} btn-work-state working-state-text"
            data-popup="confirmWork"
          >
            근무 ${workingStateText}
          </button>
        </div>
      </div>
    `;

    document.querySelector('.my-info').innerHTML = myInfoHtml;
    
    // 업데이트 후 다시 이벤트 연결
    document.getElementById('btn-work-state').addEventListener('click', () => {
      workConfirmModal.open();
    });
  };

  const mainHtml = `
    <main class="container" data-page="main">
      ${createTitle('내 정보', 1, 'title')}
      <div class="my-info container-inner"></div>
      ${createTitle('공지사항', 2, 'title')}
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
  updateMyInfo(); // 내정보 영역 넣기

  // 모달 관련 동작
  workConfirmButton.buttonClickEvent();

  // 공지사항 목록 추가하기(최근 글 10개 가져오기)
  try {
    const fetchRecentNotices = async () => {
      const noticesRef = collection(DB, 'notices');
      const q = query(noticesRef, orderBy('writedAt', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
    
      const recentNoticeDataArr = [];
      querySnapshot.forEach(doc => {
        recentNoticeDataArr.push(doc.data());
      });

      return recentNoticeDataArr;
    };

    fetchRecentNotices().then(recentNoticeDataArr => {
      if (recentNoticeDataArr.length > 0) {
        const postCont = document.querySelector('.postcard-container');
        postCont.innerHTML = '';
        recentNoticeDataArr.map(data => {
          const postcard = createCard({
            classList: ['swiper-slide'],
            title: cuttingString(data.title, 20),
            content: cuttingString(data.contents, 30),
            thumb: data.image,
            writer: cuttingString(data.author, 10),
            createat: data.writedAt
          });
          postCont.insertAdjacentHTML('beforeend', postcard.render());
        });
      }
    });
  } catch (err) {
    console.error(err);
  }

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
    workConfirmModal.open();
  });
  document.getElementById('cancelWorkBtn').addEventListener('click', () => {
    workConfirmModal.close();
  });
}
