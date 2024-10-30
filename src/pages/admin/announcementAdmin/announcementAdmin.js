import { fetchCurrentUserData } from '@utils/fetchCurrentUserData';
import { saveDataToDB, uploadFileToStorage } from '../../../utils/saveDataToDB';
import Announcement from '../../front/Announcement/Announcement';

const announcementAdmin = async () => {
  const CURRENT_USER = await fetchCurrentUserData();

  await Announcement();

  try {
    const CONTAINER = document.querySelector('.container');

    const renderNoticeEditor = () => {
      CONTAINER.innerHTML = `
      <div class="add-notice-wrapper">
        <div class="add-notice-content">
        <h2>공지사항 등록</h2>
        <div class="content-img">
          <img class="img-preview" src="https://firebasestorage.googleapis.com/v0/b/devcamp-toyproject1.appspot.com/o/notice-images%2Fmegaphone-with-empty-sign-copy-space-symbol-background-3d-illustration.jpg?alt=media&token=958f0d7c-f847-49ef-bbbb-2e394d3bf825" alt="기본공지사항이미지">
          <div class="button-box">
            <button class="btn btn-solid upload-img-btn">이미지 등록하기</button>
          </div>
        </div>
        <input type="file" accept="Image/*" style="display: none">
        <div class="content-contents">
          <input type="text" placeholder="공지사항 제목을 입력해 주세요.">
          <textarea name="" id="" placeholder="공지사항 내용을 입력해 주세요"></textarea>
        </div>
        <!-- 작성자 이름, 날짜 자동 생성되어 글 등록 -->
        <span></span>
        <div class="button-box">
          <button class="btn btn-solid register-notice-btn">등록</button>
          <button class="btn btn-outline close-btn">닫기</button>
        </div>
      </div>
    `;
      const UPLOAD_IMG_BTN = CONTAINER.querySelector('.upload-img-btn');
      const INPUT_TYPE_FILE = CONTAINER.querySelector('input[type="file"]');
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
        window.location.href = '/temp';
      });

      REGISTER_NOTICE_BTN.addEventListener(
        'click', async () =>
        await saveNoticeDataToDB(
          INPUT_TITLE.value,
          INPUT_CONTENTS.value,
          selectedImageFile,
          ERROR_SPAN,
        ),
      );
    };

    if (CURRENT_USER.isAdmin) {
      const ADD_NOTICE_BTN = document.createElement('button');
      ADD_NOTICE_BTN.className = 'btn btn-solid add-announcement-btn';
      ADD_NOTICE_BTN.textContent = '공지사항 등록';
      CONTAINER.appendChild(ADD_NOTICE_BTN);

      ADD_NOTICE_BTN.addEventListener('click', renderNoticeEditor);
    }
  } catch (error) {
    console.error(error);
  }

  // DB 저장 로직
  const saveNoticeDataToDB = async (
    titleValue,
    contentsValue,
    selectedImageFile,
    errorSpan,
  ) => {
    console.log('호출됨!')
    const NEW_DATE = new Date()
    const NOW = `${NEW_DATE.getFullYear()}년 ${NEW_DATE.getMonth() + 1}월 ${NEW_DATE.getDate()}일 ${NEW_DATE.getHours()}시 ${NEW_DATE.getMinutes()}분`

    try {
      if (titleValue === '' || contentsValue === '') {
        errorSpan.textContent = '제목과 내용을 모두 입력 후 등록 가능합니다.';
        return
      }

      let imageURL =
        'https://firebasestorage.googleapis.com/v0/b/devcamp-toyproject1.appspot.com/o/notice-images%2Fmegaphone-with-empty-sign-copy-space-symbol-background-3d-illustration.jpg?alt=media&token=958f0d7c-f847-49ef-bbbb-2e394d3bf825'; // 기본 이미지 URL

      if (selectedImageFile) {
        imageURL = uploadFileToStorage('notice-images', selectedImageFile);
      }

      await saveDataToDB('notices', {
        title: titleValue,
        contents: contentsValue,
        image: imageURL,
        author: CURRENT_USER.name,
        writedAt: NOW,
      });
    } catch (error) {
      console.error(error);
    }
  };
};

export default announcementAdmin;
