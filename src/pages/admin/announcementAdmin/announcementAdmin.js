import { fetchCurrentUserData } from '@utils/fetchCurrentUserData';
import { saveDataToDB, uploadFileToStorage } from '../../../utils/saveDataToDB';
import Announcement from '../../front/Announcement/Announcement';
import { DB } from '../../../../firebaseConfig';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';

const announcementAdmin = async () => {
  const URL_PARAMS = new URLSearchParams(window.location.search);
  const INIT_NOTICE_INFO_VALUE = URL_PARAMS.get('noticeinfo');

  const CURRENT_USER = await fetchCurrentUserData();

  const ANNOUNCEMENT_CONTAINER = await Announcement();
  document.body.appendChild(ANNOUNCEMENT_CONTAINER);

  try {
    const CONTAINER = document.querySelector('.container');

    const renderNoticeEditor = () => {
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
      const REGISTER_NOTICE_BTN = CONTAINER.querySelector(
        '.register-notice-btn',
      );
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

        UPLOAD_IMG_BTN.addEventListener('click', () => {
          INPUT_TYPE_FILE.click();
        });
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
      const IMG_PREVIEW = CONTAINER.querySelector('.content-img img');
      const INPUT_TITLE = CONTAINER.querySelector(
        '.content-title input:nth-child(1)',
      );
      const INPUT_CONTENTS = CONTAINER.querySelector(
        '.add-notice-content textarea',
      );

      CONTAINER.querySelector(
        '.add-notice-content .content-img',
      ).insertAdjacentHTML(
        'beforeend',
        '<button class="btn btn-solid upload-img-btn">이미지 등록하기</button>',
      );
      CONTAINER.querySelector(
        '.add-notice-wrapper .button-box',
      ).insertAdjacentHTML(
        'beforeend',
        '<button class="btn btn-solid modify-notice-btn">수정</button><button class="btn btn-solid delete-notice-btn">삭제</button>',
      );
      CONTAINER.querySelector('.add-notice-wrapper').insertAdjacentHTML(
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

        UPLOAD_IMG_BTN.addEventListener('click', () => {
          INPUT_TYPE_FILE.click();
        });
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

      // 전체적으로 인자, 매개변수 정리!
    };

    const POSTCARDS = CONTAINER.querySelectorAll(
      '.postcard-container .postcard',
    );
    POSTCARDS.forEach(card => {
      card.addEventListener('click', () => {
        const NOTICE_ID = card.getAttribute('data-id');
        modifyExistingNotice(NOTICE_ID);
      });
    });

    if (CURRENT_USER.isAdmin) {
      const ADD_NOTICE_BTN = document.createElement('button');
      ADD_NOTICE_BTN.className = 'btn btn-solid add-announcement-btn';
      ADD_NOTICE_BTN.textContent = '공지사항 등록';
      CONTAINER.appendChild(ADD_NOTICE_BTN);

      ADD_NOTICE_BTN.addEventListener('click', () => renderNoticeEditor('add'));
    }
  } catch (error) {
    console.error(error);
  }

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
  ) => {
    const NEW_DATE = new Date();
    const NOW = `${NEW_DATE.getFullYear()}년 ${NEW_DATE.getMonth() + 1}월 ${NEW_DATE.getDate()}일 ${NEW_DATE.getHours()}시 ${NEW_DATE.getMinutes()}분`;

    try {
      if (titleValue === '' || contentsValue === '') {
        errorSpan.textContent = errorSpanMessage;
        return;
      }

      if (confirm(askMessage)) {
        let imageURL =
          'https://firebasestorage.googleapis.com/v0/b/devcamp-toyproject1.appspot.com/o/notice-images%2Fmegaphone-with-empty-sign-copy-space-symbol-background-3d-illustration.jpg?alt=media&token=958f0d7c-f847-49ef-bbbb-2e394d3bf825'; // 기본 이미지 URL

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
        } else if (workType === 'modify') {
          console.log(noticeId);
          await setDoc(doc(DB, 'notices', noticeId), {
            title: titleValue,
            contents: contentsValue,
            image: imageURL,
            author: CURRENT_USER.name,
            updateAt: NOW,
          });
        } else {
          await deleteDoc(doc(DB, 'notices', noticeId));
        }
        alert(confirmMessage);
      } else {
        alert(cancelMessage);
      }
    } catch (error) {
      console.error(error);
    }
  };
};

export default announcementAdmin;
