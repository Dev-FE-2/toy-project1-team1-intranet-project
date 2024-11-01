import { fetchCurrentUserData } from '@utils/fetchCurrentUserData';
import { fetchCollectionData } from '@utils/fetchCollectionData';
import { saveDataToDB, uploadFileToStorage } from '../../../utils/saveDataToDB';
import { DB } from '../../../../firebaseConfig';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';

const notice = async () => {
  const URL_PARAMS = new URL(window.location.href);
  const URL_SEARCH_PARAMS = new URLSearchParams(window.location.search);
  const INIT_ADD_NOTICE = URL_SEARCH_PARAMS.get('addnotice');
  const INIT_NOTICE_INFO = URL_SEARCH_PARAMS.get('noticeinfo');

  const CURRENT_USER = await fetchCurrentUserData();
  const ALL_NOTICE_DATA = await fetchCollectionData('notices');
  const APP = document.querySelector('#app');
  const CONTAINER = document.createElement('div');
  CONTAINER.className = 'container';
  APP.append(CONTAINER);

  const SEARCH_DATA = URL_SEARCH_PARAMS.get('search') || '';

  const FILTERED_NOTICE_DATA = ALL_NOTICE_DATA.filter(
    notice =>
      notice?.title.includes(SEARCH_DATA) ||
      notice?.contents.includes(SEARCH_DATA) ||
      notice?.author.includes(SEARCH_DATA),
  );

  const ITEMS_PER_PAGE = 8;
  const TOTAL_ITEMS = FILTERED_NOTICE_DATA.length;
  const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
  const CURRENT_PAGE = parseInt(URL_SEARCH_PARAMS.get('pagination') || '1', 10);

  const renderNoticeList = () => {
    const START_INDEX = (CURRENT_PAGE - 1) * ITEMS_PER_PAGE;
    const END_INDEX = START_INDEX + ITEMS_PER_PAGE;
    const PAGE_NOTICE_DATA = FILTERED_NOTICE_DATA.slice(START_INDEX, END_INDEX);

    CONTAINER.innerHTML = `
      <h1 class="title">공지사항</h1>
      <div class="container__title title">
        <div class="announcement__search-box">
          <input type="search" id="search" placeholder="검색어를 입력하세요" />
          <span class="material-symbols-outlined search-icon">search</span>
        </div>
      </div>
      <div class="postcard-container">
      ${PAGE_NOTICE_DATA.map(
        data => `
        <div class="postcard" data-id=${data.id}>
          <img class="postcard-img" src="${data.image}" alt="공지사항 이미지" />
          <div class="contents">
            <h2 class="contents__title">${cuttingString(data.title, 20)}</h2>
            <p class="contents__content">${cuttingString(data.contents, 40)}</p>
            <div class="contents__information">
              <span class="information-author">${cuttingString(data.author, 10)}</span>
              <span class="information-date">${data.updateAt ? cuttingString(data.updateAt, 15) : cuttingString(data.writedAt, 15)}</span>
            </div>
          </div>
        </div>`,
      ).join('')}
      </div>
      <button class='btn btn-solid add-notice-btn'>공지사항 등록</button>
      ${
        TOTAL_ITEMS > 0
          ? `
        <div class="pagination">
          <ul class="paging-list" role="list">
            <li class="paging-item prev">
              <button class="btn" type="button" aria-label="이전 페이지" ${CURRENT_PAGE === 1 ? 'disabled' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 34 34">
                  <line x1="20" y1="6" x2="12" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                  <line x1="12" y1="17" x2="20" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                </svg>
              </button>
            </li>
            ${Array.from(
              { length: TOTAL_PAGES },
              (_, i) => `
              <li class="paging-item ${CURRENT_PAGE === i + 1 ? 'is-active' : ''}" ${CURRENT_PAGE === i + 1 ? 'aria-current="page"' : ''}>
                <a href="javascript:void(0);" data-page="${i + 1}">${i + 1}</a>
              </li>
            `,
            ).join('')}
            <li class="paging-item next">
              <button class="btn" type="button" aria-label="다음 페이지" ${CURRENT_PAGE === TOTAL_PAGES ? 'disabled' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 34 34">
                  <line x1="14" y1="6" x2="22" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                  <line x1="22" y1="17" x2="14" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                </svg>
              </button>
            </li>
          </ul>
        </div>`
          : ''
      }
    `;

    setupSearchListeners();
    setupPaginationListeners();

    function cuttingString(text = '', limit) {
      if (text.length > limit) {
        return text.slice(0, limit) + '...';
      }
      return text;
    }

    const ADD_NOTICE_BTN = CONTAINER.querySelector('.add-notice-btn');
    ADD_NOTICE_BTN.addEventListener('click', () => {
      URL_SEARCH_PARAMS.set('addnotice', true);
      history.pushState(null, null, `?${URL_SEARCH_PARAMS.toString()}`);
      renderNoticeEditor('add', '');
    });

    const POSTCARDS = CONTAINER.querySelectorAll('.postcard');
    POSTCARDS.forEach(card => {
      const NOTICE_ID = card.getAttribute('data-id');

      card.addEventListener('click', () => {
        URL_SEARCH_PARAMS.set('noticeinfo', NOTICE_ID);
        history.pushState(null, null, `?${URL_SEARCH_PARAMS.toString()}`);
        renderNoticeEditor('modify', NOTICE_ID);
      });
    });
  };

  const setupSearchListeners = () => {
    const SEARCH_INPUT = document.getElementById('search');
    const SEARCH_ICON = document.querySelector('.search-icon');

    const performSearch = () => {
      const SEARCH_INPUT_VALUE = SEARCH_INPUT.value.trim();
      const NEW_URL = new URL(window.location.href);

      if (SEARCH_INPUT_VALUE) {
        NEW_URL.searchParams.set('search', SEARCH_INPUT_VALUE);
        NEW_URL.searchParams.set('pagination', '1');
      } else {
        NEW_URL.searchParams.delete('search');
        NEW_URL.searchParams.delete('pagination');
      }

      window.location.href = NEW_URL.toString();
    };

    SEARCH_INPUT.addEventListener('keyup', e => {
      if (e.key === 'Enter') performSearch();
    });

    SEARCH_ICON.addEventListener('click', performSearch);
  };
  const setupPaginationListeners = () => {
    const PREV_BTN = document.querySelector('.paging-item.prev .btn');
    const NEXT_BTN = document.querySelector('.paging-item.next .btn');
    const PAGE_LINKS = document.querySelectorAll(
      '.paging-item:not(.prev):not(.next) a',
    );

    const navigateToPage = page => {
      const NEW_URL = new URL(window.location.href);

      NEW_URL.searchParams.set('pagination', page);

      window.location.href = NEW_URL.toString();
    };

    if (PREV_BTN) {
      PREV_BTN.addEventListener('click', () => {
        if (CURRENT_PAGE > 1) {
          navigateToPage(CURRENT_PAGE - 1);
        }
      });
    }

    if (NEXT_BTN) {
      NEXT_BTN.addEventListener('click', () => {
        if (CURRENT_PAGE < TOTAL_PAGES) {
          navigateToPage(CURRENT_PAGE + 1);
        }
      });
    }

    PAGE_LINKS.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const PAGE = link.textContent;
        navigateToPage(PAGE);
      });
    });
  };

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
    const REGISTER_NOTICE_BTN = CONTAINER.querySelector('.register-notice-btn');
    const MODIFY_NOTICE_BTN = CONTAINER.querySelector('.modify-notice-btn');
    const DELETE_NOTICE_BTN = CONTAINER.querySelector('.delete-notice-btn');

    try {
      if (workType === 'add') {
        REGISTER_NOTICE_BTN.disabled = true
      } else {
        MODIFY_NOTICE_BTN.disabled = true
        DELETE_NOTICE_BTN.disabled = true
      }
      if (titleValue === '' || contentsValue === '') {
        errorSpan.textContent = errorSpanMessage;
        return;
      }

      if (confirm(askMessage)) {
        let imageURL =
          workType === 'add'
            ? 'https://firebasestorage.googleapis.com/v0/b/devcamp-toyproject1.appspot.com/o/notice-images%2FdefaultNoticeImage.jpg?alt=media&token=5c523316-9d63-405f-be64-3828a7356922'
            : existingImg;

        if (selectedImageFile) {
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
        window.history.back();
        alert(confirmMessage);
      } else {
        alert(cancelMessage);
      }
    } catch (error) {
      console.error(error);
    } finally {
      REGISTER_NOTICE_BTN.disabled = false
      MODIFY_NOTICE_BTN.disabled = false
      DELETE_NOTICE_BTN.disabled = false
    }
  };

  const renderNoticeEditor = (workType, noticeId) => {
    const SPECIFIC_NOTICE_INFO = ALL_NOTICE_DATA.find(
      data => data.id === noticeId,
    );

    CONTAINER.innerHTML = `
      <div class="add-notice-wrapper">
        <div class="add-notice-content">
        <h2 class='title'>${workType === 'add' ? '공지사항 등록' : '공지사항 수정/삭제'}</h2>
        <div class="content-img">
          <img class="img-preview"
          src="${
            workType === 'add'
              ? 'https://firebasestorage.googleapis.com/v0/b/devcamp-toyproject1.appspot.com/o/notice-images%2FdefaultNoticeImage.jpg?alt=media&token=5c523316-9d63-405f-be64-3828a7356922'
              : SPECIFIC_NOTICE_INFO.image
          }"alt="공지사항이미지">
          <div class="button-box">
            <button class="btn btn-solid upload-img-btn">이미지 등록하기</button>
          </div>
        </div>
        <input type="file" accept="Image/*" style="display: none">
        <div class="content-main">
          <input class="content-title" type="text" placeholder="공지사항 제목을 입력해 주세요." value="${workType === 'add' ? '' : SPECIFIC_NOTICE_INFO.title}"/>
          <div class="main-contents">
            <textarea class="content-contents" placeholder="공지사항 내용을 입력해 주세요">${workType === 'add' ? '' : SPECIFIC_NOTICE_INFO.contents}</textarea> 
          </div>
        </div>
        <span></span>
        <div class="button-box">
        ${
          workType === 'add'
            ? '<button class="btn btn-solid register-notice-btn">등록</button>'
            : `<button class="btn btn-solid delete-notice-btn">삭제</button>
          <button class="btn btn-solid modify-notice-btn">수정</button>`
        }  
          <button class="btn btn-outline close-btn">닫기</button>
        </div>
      </div>
    `;

    const UPLOAD_IMG_BTN = CONTAINER.querySelector('.upload-img-btn');
    const IMG_PREVIEW = CONTAINER.querySelector('.img-preview');
    const REGISTER_NOTICE_BTN = CONTAINER.querySelector('.register-notice-btn');
    const MODIFY_NOTICE_BTN = CONTAINER.querySelector('.modify-notice-btn');
    const DELETE_NOTICE_BTN = CONTAINER.querySelector('.delete-notice-btn');
    const CLOSE_BTN = CONTAINER.querySelector('.close-btn');
    const INPUT_TITLE = CONTAINER.querySelector('.content-main .content-title');
    const INPUT_CONTENTS = CONTAINER.querySelector(
      '.content-main .content-contents',
    );
    const MAIN_CONTENTS = CONTAINER.querySelector('.content-main .main-contents')

    MAIN_CONTENTS.addEventListener('click', e => {
      if (e.target !== INPUT_CONTENTS) {
        INPUT_CONTENTS.focus()
      }
    })

    const ERROR_SPAN = CONTAINER.querySelector('span');

    const autoResize = textarea => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    INPUT_TITLE.addEventListener('input', () => autoResize(INPUT_TITLE));
    INPUT_CONTENTS.addEventListener('input', () => autoResize(INPUT_CONTENTS));
    INPUT_TITLE.addEventListener('keydown', e => {
      if ((e.key = 'Enter')) {
        e.preventDefault();
      }
    });

    autoResize(INPUT_TITLE);
    autoResize(INPUT_CONTENTS);

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

    if (workType === 'add') {
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
    } else if (workType === 'modify') {
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
    }
  };

  if (INIT_NOTICE_INFO) {
    renderNoticeEditor('modify', INIT_NOTICE_INFO);
  } else if (INIT_ADD_NOTICE === 'true') {
    renderNoticeEditor('add', '');
  } else {
    renderNoticeList();
  }
};

export default notice;
