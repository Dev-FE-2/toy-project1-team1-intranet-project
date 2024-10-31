import { fetchCurrentUserData } from '@utils/fetchCurrentUserData';
import { saveDataToDB, uploadFileToStorage } from '../../../utils/saveDataToDB';
import Announcement from '../../front/Announcement/Announcement';
import { DB } from '../../../../firebaseConfig';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';

const announcementAdmin = async () => {
  const URL_PARAMS = new URLSearchParams(window.location.search);
  const CURRENT_USER = await fetchCurrentUserData();
  let currentContainer = null; // 현재 컨테이너 참조 저장
  let isAdminView = true;

  // DB 저장 로직
  const saveNoticeDataToDB = async (
    workType,
    noticeId,
    askMessage,
    confirmMessage,
    cancelMessage,
    selectedImageFile,
    titleValue,
    contentsValue,
    errorSpan,
    errorSpanMessage,
    existingImg,
  ) => {
    const NEW_DATE = new Date();
    const NOW = `${NEW_DATE.getFullYear()}년 ${NEW_DATE.getMonth() + 1}월 ${NEW_DATE.getDate()}일`;

    try {
      if (titleValue === '' || contentsValue === '') {
        errorSpan.textContent = errorSpanMessage;
        return;
      }

      if (confirm(askMessage)) {
        let imageURL =
          workType === 'add'
            ? 'https://firebasestorage.googleapis.com/v0/b/devcamp-toyproject1.appspot.com/o/notice-images%2Fmegaphone-with-empty-sign-copy-space-symbol-background-3d-illustration.jpg?alt=media&token=958f0d7c-f847-49ef-bbbb-2e394d3bf825'
            : existingImg;

        if (selectedImageFile) {
          console.log(selectedImageFile);
          imageURL = await uploadFileToStorage(
            `notice-images/${Date.now()}_${selectedImageFile.name}`,
            selectedImageFile,
          );
        }

        if (workType === 'add') {
          await saveDataToDB('notices', {
            title: titleValue,
            contents: contentsValue,
            image: imageURL,
            author: CURRENT_USER.name,
            writedAt: NOW,
          });

          window.location.reload();
        } else if (workType === 'modify') {
          console.log(noticeId);
          await setDoc(doc(DB, 'notices', noticeId), {
            title: titleValue,
            contents: contentsValue,
            image: imageURL,
            author: CURRENT_USER.name,
            updateAt: NOW,
          });

          // 수정 시 현재 페이지의 내용만 업데이트
          const container = document.querySelector('.container');
          if (container) {
            const imgPreview = container.querySelector('.content-img img');
            const inputTitle = container.querySelector(
              '.content-title input:nth-child(1)',
            );
            const inputContents = container.querySelector(
              '.notice-info textarea',
            );

            imgPreview.src = imageURL;
            inputTitle.value = titleValue;
            inputContents.value = contentsValue;

            // 현재 상태 유지
            modifyExistingNotice(noticeId);
          }
        } else {
          await deleteDoc(doc(DB, 'notices', noticeId));
          // await renderNewContainer(); // 삭제 시 전체 화면 리로드
          window.history.back();
        }
        alert(confirmMessage);
      } else {
        alert(cancelMessage);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderNoticeEditor = () => {
    const CONTAINER = document.querySelector('.container');

    CONTAINER.innerHTML = `
      <div class="add-notice-wrapper">
        <div class="add-notice-content">
        <h2>공지사항 등록</h2>
        <div class="content-img">
          <img class="img-preview" src='https://firebasestorage.googleapis.com/v0/b/devcamp-toyproject1.appspot.com/o/notice-images%2Fmegaphone-with-empty-sign-copy-space-symbol-background-3d-illustration.jpg?alt=media&token=958f0d7c-f847-49ef-bbbb-2e394d3bf825' alt="기본공지사항이미지">
          <div class="button-box">
            <button class="btn btn-solid upload-img-btn">이미지 등록하기</button>
          </div>
        </div>
        <input type="file" accept="Image/*" style="display: none">
        <div class="content-contents">
          <input type="text" placeholder="공지사항 제목을 입력해 주세요.">
          <textarea placeholder="공지사항 내용을 입력해 주세요"></textarea>
        </div>
        <span></span>
        <div class="button-box">
          <button class="btn btn-solid register-notice-btn">등록</button>
          <button class="btn btn-outline close-btn">닫기</button>
        </div>
      </div>
    `;

    const UPLOAD_IMG_BTN = CONTAINER.querySelector('.upload-img-btn');
    const IMG_PREVIEW = CONTAINER.querySelector('.img-preview');
    const REGISTER_NOTICE_BTN = CONTAINER.querySelector('.register-notice-btn');
    const CLOSE_BTN = CONTAINER.querySelector('.close-btn');
    const INPUT_TITLE = CONTAINER.querySelector('.content-contents input');
    const INPUT_CONTENTS = CONTAINER.querySelector(
      '.content-contents textarea',
    );
    const ERROR_SPAN = CONTAINER.querySelector('span');

    let selectedImageFile = null;

    // 이미지 미리보기 처리
    const handleImagePreview = file => {
      const FILE_READER = new FileReader();
      FILE_READER.onload = e => {
        IMG_PREVIEW.src = e.target.result;
      };
      FILE_READER.readAsDataURL(file);
    };

    const uploadImageTemporarily = () => {
      const INPUT_TYPE_FILE = document.createElement('input');
      INPUT_TYPE_FILE.type = 'file';
      INPUT_TYPE_FILE.accept = 'image/*';

      INPUT_TYPE_FILE.addEventListener('change', e => {
        const FILE = e.target.files[0];
        if (!FILE) return;

        // 파일 크기 체크 (5MB 제한)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (FILE.size > MAX_FILE_SIZE) {
          alert('파일 크기는 5MB 이하여야 합니다.');
          return;
        }

        // 이미지 파일 타입 체크
        if (!FILE.type.startsWith('image/')) {
          alert('이미지 파일만 업로드 가능합니다.');
          return;
        }

        selectedImageFile = FILE;
        handleImagePreview(FILE);
      });

      INPUT_TYPE_FILE.click();
    };

    UPLOAD_IMG_BTN.addEventListener('click', uploadImageTemporarily);

    CLOSE_BTN.addEventListener('click', () => {
      window.history.back();
    });

    REGISTER_NOTICE_BTN.addEventListener('click', async () => {
      const ASK_MESSAGE = '공지사항을 등록하시겠습니까?';
      const CONFIRM_MESSAGE = '공지사항이 성공적으로 등록되었습니다.';
      const CANCEL_MESSAGE = '공지사항 등록이 취소되었습니다.';
      const ERROR_SPAN_MESSAGE =
        '제목과 내용을 모두 입력해야만 공지사항 등록이 가능합니다';
      await saveNoticeDataToDB(
        'add',
        '',
        ASK_MESSAGE,
        CONFIRM_MESSAGE,
        CANCEL_MESSAGE,
        selectedImageFile,
        INPUT_TITLE.value,
        INPUT_CONTENTS.value,
        ERROR_SPAN,
        ERROR_SPAN_MESSAGE,
      );
    });
  };

  const modifyExistingNotice = noticeId => {
    const CONTAINER = document.querySelector('.container');

    // 이미 수정 페이지인 경우 버튼 중복 추가 방지
    if (CONTAINER.querySelector('.upload-img-btn')) {
      return;
    }

    const IMG_PREVIEW = CONTAINER.querySelector('.content-img img');
    const INPUT_TITLE = CONTAINER.querySelector(
      '.content-title input:nth-child(1)',
    );
    const INPUT_CONTENTS = CONTAINER.querySelector('.notice-info textarea');

    CONTAINER.querySelector('.notice-info .content-img').insertAdjacentHTML(
      'beforeend',
      '<button class="btn btn-solid upload-img-btn">이미지 등록하기</button>',
    );
    CONTAINER.querySelector(
      '.notice-info-wrapper .button-box',
    ).insertAdjacentHTML(
      'beforeend',
      '<button class="btn btn-solid modify-notice-btn">수정</button><button class="btn btn-solid delete-notice-btn">삭제</button>',
    );
    CONTAINER.querySelector('.notice-info').insertAdjacentHTML(
      'afterbegin',
      '<span></span>',
    );

    INPUT_TITLE.removeAttribute('readonly');
    INPUT_CONTENTS.removeAttribute('readonly');

    const UPLOAD_IMG_BTN = CONTAINER.querySelector('.upload-img-btn');
    const MODIFY_NOTICE_BTN = CONTAINER.querySelector('.modify-notice-btn');
    const DELETE_NOTICE_BTN = CONTAINER.querySelector('.delete-notice-btn');
    const ERROR_SPAN = CONTAINER.querySelector('.add-notice-wrapper span');

    let selectedImageFile = null;

    // 이미지 미리보기 처리
    const handleImagePreview = file => {
      const FILE_READER = new FileReader();
      FILE_READER.onload = e => {
        IMG_PREVIEW.src = e.target.result;
      };
      FILE_READER.readAsDataURL(file);
    };

    const uploadImageTemporarily = () => {
      const INPUT_TYPE_FILE = document.createElement('input');
      INPUT_TYPE_FILE.type = 'file';
      INPUT_TYPE_FILE.accept = 'image/*';

      INPUT_TYPE_FILE.addEventListener('change', e => {
        const FILE = e.target.files[0];
        if (!FILE) return;

        // 파일 크기 체크 (5MB 제한)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (FILE.size > MAX_FILE_SIZE) {
          alert('파일 크기는 5MB 이하여야 합니다.');
          return;
        }

        // 이미지 파일 타입 체크
        if (!FILE.type.startsWith('image/')) {
          alert('이미지 파일만 업로드 가능합니다.');
          return;
        }

        selectedImageFile = FILE;
        handleImagePreview(FILE);
      });

      INPUT_TYPE_FILE.click();
    };

    UPLOAD_IMG_BTN.addEventListener('click', uploadImageTemporarily);

    MODIFY_NOTICE_BTN.addEventListener('click', async () => {
      const ASK_MESSAGE = '공지사항을 수정하시겠습니까?';
      const CONFIRM_MESSAGE = '공지사항이 성공적으로 수정되었습니다.';
      const CANCEL_MESSAGE = '공지사항 수정이 취소되었습니다.';
      const ERROR_SPAN_MESSAGE =
        '제목과 내용을 모두 입력해야만 공지사항 수정이 가능합니다';
      await saveNoticeDataToDB(
        'modify',
        noticeId,
        ASK_MESSAGE,
        CONFIRM_MESSAGE,
        CANCEL_MESSAGE,
        selectedImageFile,
        INPUT_TITLE.value,
        INPUT_CONTENTS.value,
        ERROR_SPAN,
        ERROR_SPAN_MESSAGE,
        IMG_PREVIEW.src,
      );
    });

    DELETE_NOTICE_BTN.addEventListener('click', async () => {
      const ASK_MESSAGE =
        '공지사항을 삭제하시겠습니까?\n삭제 진행 시 복원할 수 없습니다.';
      const CONFIRM_MESSAGE = '공지사항이 성공적으로 삭제되었습니다.';
      const CANCEL_MESSAGE = '공지사항 삭제가 취소되었습니다.';
      await saveNoticeDataToDB(
        'delete',
        noticeId,
        ASK_MESSAGE,
        CONFIRM_MESSAGE,
        CANCEL_MESSAGE,
      );
    });
  };

  // 컨테이너 정리 함수
  const cleanupContainer = () => {
    if (currentContainer) {
      // 이벤트 리스너 제거
      const POSTCARDS = currentContainer.querySelectorAll(
        '.postcard-container .postcard',
      );
      POSTCARDS.forEach(card => {
        card.removeEventListener('click', () => {});
      });

      const ADD_NOTICE_BTN = currentContainer.querySelector(
        '.add-announcement-btn',
      );
      if (ADD_NOTICE_BTN) {
        ADD_NOTICE_BTN.removeEventListener('click', () => {});
      }

      // DOM에서 제거
      if (currentContainer.parentNode) {
        currentContainer.parentNode.removeChild(currentContainer);
      }
      currentContainer = null;
    }
  };

  // 새로운 컨테이너 렌더링 함수
  const renderNewContainer = async () => {
    if (!isAdminView) return; // 관리자 뷰가 아니면 렌더링하지 않음

    cleanupContainer();

    // 기존 #app 내부의 컨테이너 제거
    const APP_CONTAINER = document.querySelector('#app');
    if (APP_CONTAINER) {
      APP_CONTAINER.innerHTML = '';
    }

    currentContainer = await Announcement();
    APP_CONTAINER.appendChild(currentContainer);

    const NOTICE_ID = URL_PARAMS.get('noticeinfo');

    if (NOTICE_ID) {
      modifyExistingNotice(NOTICE_ID)
    } else {
      setupAdminFeatures(currentContainer);
    }
  };

  // Admin 기능 설정
  function setupAdminFeatures(container) {
    if (!CURRENT_USER.isAdmin) return;

    try {
      const POSTCARDS = container.querySelectorAll(
        '.postcard-container .postcard',
      );
      POSTCARDS.forEach(card => {
        const clickHandler = () => {
          const NOTICE_ID = card.getAttribute('data-id');
          modifyExistingNotice(NOTICE_ID);
        };
        card.removeEventListener('click', clickHandler); // 기존 이벤트 리스너 제거
        card.addEventListener('click', clickHandler);
      });

      // 기존 버튼 제거
      const EXISTING_BTN = container.querySelector('.add-announcement-btn');
      if (EXISTING_BTN) {
        EXISTING_BTN.remove();
      }

      const ADD_NOTICE_BTN = document.createElement('button');
      ADD_NOTICE_BTN.className = 'btn btn-solid add-announcement-btn';
      ADD_NOTICE_BTN.textContent = '공지사항 등록';
      container.appendChild(ADD_NOTICE_BTN);

      const addNoticeHandler = () => renderNoticeEditor();
      ADD_NOTICE_BTN.removeEventListener('click', addNoticeHandler); // 기존 이벤트 리스너 제거
      ADD_NOTICE_BTN.addEventListener('click', addNoticeHandler);
    } catch (error) {
      console.error(error);
    }
  }

  // popstate 이벤트 핸들러
  const handlePopState = async event => {
    // URL을 확인하여 관리자 뷰인지 판단
    const IS_ADMIN_URL = window.location.pathname.includes(
      '/admin/announcement',
    );
    isAdminView = IS_ADMIN_URL;

    if (isAdminView) {
      await renderNewContainer();
    }
  };

  // popstate 이벤트 리스너 등록
  window.addEventListener('popstate', handlePopState);
  await renderNewContainer();
};

export default announcementAdmin;
