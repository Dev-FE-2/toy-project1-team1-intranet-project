import { easepick, LockPlugin, RangePlugin } from '@easepick/bundle';
import { fetchCollectionData } from '@utils/fetchCollectionData';
import { saveDataToDB } from '@utils/saveDataToDB';
import {
  createPagination,
  addPaginationListeners,
} from '@components/Pagination/Pagination';
import createModal from '@components/Modal/Modal';
import createTitle from '@components/Title/Title';

// 테이블 헤더
const TABLE_HEADER = `
  <li class="col">
    <ul class="head" role="list-head">
      <li class="type">구분</li>
      <li class="date">일자</li>
      <li class="status">처리상태</li>
      <li class="reason">신청사유</li>
      <li class="etc">비고</li>
    </ul>
  </li>
`;

// 부재 유형 매핑
const ABSENCE_TYPE_MAPPING = {
  'am-half': '오전반차',
  'pm-half': '오후반차',
  annual: '연차',
  official: '공가',
  sick: '병가',
  alternative: '대체휴가',
};

let selectedUploadFile = null; // 파일 참조 변수

// Firestore 데이터 가져오기
const fetchAbsenceRecords = async () => {
  try {
    return await fetchCollectionData('absences', 'createdAt', 'desc');
  } catch (error) {
    console.error('Error fetching absence data:', error);
    return [];
  }
};

// 부재 상태에 따른 CSS 클래스 반환
const getStatusBadgeClassName = status => {
  switch (status) {
    case '승인':
      return 'badge-success';
    case '승인대기':
      return 'badge-warn';
    case '반려':
      return 'badge-error';
    default:
      return '';
  }
};

// 테이블을 현재 페이지에 맞춰 렌더링
const renderTable = (data, page, itemsPerPage) => {
  const startIndex = (page - 1) * itemsPerPage;
  const limitedData = data.slice(startIndex, startIndex + itemsPerPage);
  const rows =
    limitedData.length > 0
      ? limitedData.map(renderRow).join('')
      : `<li class="col"><p>부재 이력이 없습니다.</p></li>`;

  document.querySelector('.table-body ul.table').innerHTML =
    `${TABLE_HEADER} ${rows}`;
};

// 개별 행 렌더링
const renderRow = item => `
  <li class="col">
    <ul class="cell" role="list">
      <li class="type">${ABSENCE_TYPE_MAPPING[item.absenceType] || item.absenceType}</li>
      <li class="date">${item.absenceDate}</li>
      <li class="status">
        <div class="badge ${getStatusBadgeClassName(item.status)}">${item.status || '처리중'}</div> 
      </li>
      <li class="reason text-clamp">${item.reason || '-'}</li>
      <li class="etc text-clamp">${item.status === '반려' ? item.etc || '' : ''}</li>
    </ul>
  </li>
`;

// 모달 컴포넌트 생성
const absenceApplyModal = createModal({
  id: 'absenceApplyModal',
  title: '부재 신청',
  content: `
    <div class="cont">
      <div class="info-box"><span class="text-error">&#42;</span>는 필수 항목입니다.</div>
      <form action="" method="post">
        <ul class="input-list">
          <li>
            <label for="absence-type"><span class="text-error">&#42;</span>구분</label>
            <select class="" id="absence-type" name="absence-type" required>
              <option value="" selected disabled>휴가 종류</option>
              <option value="am-half">오전반차</option>
              <option value="pm-half">오후반차</option>
              <option value="annual">연차</option>
              <option value="official">공가</option>
              <option value="sick">병가</option>
              <option value="alternative">대체휴가</option>
            </select>
          </li>
          <li>
            <label for="absence-date"><span class="text-error">&#42;</span>기간</label>
            <input class="" type="text" name="absence-date" placeholder="YYYY-MM-DD" id="datepicker" readonly>
          </li>
          <li>
            <label for="reason"><span class="text-error">&#42;</span>사유 입력 (50자 이내)</label>
            <textarea class="" id="reason" name="reason" placeholder="사유를 입력하세요" required maxlength="50"></textarea>
          </li>
          <li>
            <label for="fileupload">증빙 자료 (.jpeg, .png, 5MB 이하)</label>
            <button class="btn btn-outline w100" id="fileupload">파일첨부</button>
          </li>
        </ul>
      </form>
    </div>
    <button type="button" class="close" aria-label="팝업 닫기" title="팝업 닫기" id="closePopupBtn">
      <svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
        <line x1="8" y1="8" x2="26" y2="26" stroke="black" stroke-width="1" stroke-linecap="round" />
        <line x1="8" y1="26" x2="26" y2="8" stroke="black" stroke-width="1" stroke-linecap="round" />
      </svg>
    </button>
  `,
  buttons: `
    <button id="confirmApplyBtn" class="btn btn-solid">신청</button>
    <button id="cancelApplyBtn" class="btn btn-outline">취소</button>
  `,
});

// 필터
const filterAbsenceRecords = (data, itemsPerPage, currentPage, filter) => {
  const filteredData =
    filter === 'all'
      ? data
      : data.filter(item => {
          const mappedType =
            ABSENCE_TYPE_MAPPING[item.absenceType] || item.absenceType;
          return mappedType === ABSENCE_TYPE_MAPPING[filter];
        });

  renderTable(filteredData, currentPage, itemsPerPage);
  document.querySelector('.pagination').innerHTML = createPagination(
    filteredData.length,
    currentPage,
    itemsPerPage,
  );
  addPaginationListeners(newPage =>
    handlePageChange(newPage, filteredData, itemsPerPage, currentPage),
  );
};

// 페이지 변경 핸들러
const handlePageChange = (page, data, itemsPerPage, currentPage) => {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderTable(data, page, itemsPerPage);
  document.querySelector('.pagination').innerHTML = createPagination(
    data.length,
    currentPage,
    itemsPerPage,
  );
  addPaginationListeners(newPage =>
    handlePageChange(newPage, data, itemsPerPage, currentPage),
  );
};

// 파일 업로드
const handleFileUpload = event => {
  event.preventDefault(); // 기본 클릭 이벤트 방지
  const fileInputElement = document.createElement('input');
  fileInputElement.type = 'file';
  fileInputElement.accept = 'image/png, image/jpeg';

  fileInputElement.addEventListener('change', event => {
    selectedUploadFile = event.target.files[0];
    if (selectedUploadFile) {
      const allowedTypes = ['image/png', 'image/jpeg'];
      const maxSizeInMB = 5 * 1024 * 1024;

      if (
        !allowedTypes.includes(selectedUploadFile.type) ||
        selectedUploadFile.size > maxSizeInMB
      ) {
        alert('PNG 또는 JPG, 5MB 이하 파일만 첨부 가능합니다.');
        selectedUploadFile = null;
      } else {
        console.log('유효한 파일 선택:', selectedUploadFile.name);
      }
    }
  });

  fileInputElement.click();
};

// Firebase Storage에 파일 업로드
const uploadFileToStorage = async file => {
  try {
    const storageRef = ref(STORAGE, `absence-files/${Date.now()}_${file.name}`);
    const uploadSnapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadSnapshot.ref);
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    throw error; // 에러를 던져서 상위 호출에서 처리할 수 있도록 함
  }
};

// 부재 신청 처리
const handleSubmit = async () => {
  const absenceType = document.getElementById('absence-type').value;
  const absenceDate = document.getElementById('datepicker').value;
  const reason = document.getElementById('reason').value;

  if (!absenceType || !absenceDate || !reason) {
    alert('모든 필수 항목을 입력해주세요.');
    return;
  }

  // 중복 확인
  const isOverlapOrDuplicate = await checkForOverlappingOrDuplicateAbsence(
    absenceDate,
    absenceType,
  );

  if (isOverlapOrDuplicate) {
    alert('이미 신청한 날입니다.');
    return;
  }

  const fileUrl = selectedUploadFile
    ? await uploadFileToStorage(selectedUploadFile)
    : null;

  // 데이터 저장
  const absenceData = {
    absenceType,
    absenceDate,
    reason,
    fileUrl,
    status: '승인대기',
    createdAt: new Date(),
  };

  try {
    await saveDataToDB('absences', absenceData);
    alert('신청이 완료되었습니다.');
    resetForm();
    absenceApplyModal.close();
    window.location.reload(); // 강제 새로고침 임시
  } catch (error) {
    console.error('부재 신청 저장 중 오류 발생:', error);
    alert('부재 신청 저장에 실패했습니다. 다시 시도해 주세요.');
  }
};

// 날짜 범위 중복 여부
const isDateRangeOverlapping = (startDate1, endDate1, startDate2, endDate2) => {
  return (
    (startDate1 <= endDate2 && endDate1 >= startDate2) ||
    startDate1 === startDate2
  );
};

// 중복된 날짜, 휴가 유형 확인
const checkForOverlappingOrDuplicateAbsence = async (
  absenceDate,
  absenceType,
) => {
  const existingData = await fetchAbsenceRecords();

  const isOverlapOrDuplicate = existingData.some(item => {
    // item.absenceDate가 undefined일 수 있으므로 방어 코드 추가
    if (!item.absenceDate) return false;

    // 예상되는 형식에 맞게 absenceDate를 분할, 아니면 단일 날짜로 처리
    const [start, end] = item.absenceDate.split(' - ');
    const [newStart, newEnd] = absenceDate.split(' - ');

    // start와 end가 없을 경우 default 값 설정
    const hasOverlap = isDateRangeOverlapping(
      newStart || absenceDate, // newStart가 없으면 absenceDate 자체를 사용
      newEnd || newStart || absenceDate, // newEnd가 없으면 newStart 또는 absenceDate 자체를 사용
      start,
      end || start, // end가 없으면 start 사용
    );

    const isSameTypeOnSameDay = item.absenceType === absenceType && hasOverlap;
    return hasOverlap || isSameTypeOnSameDay;
  });

  return isOverlapOrDuplicate;
};

// 폼 초기화
const resetForm = () => {
  document.getElementById('absence-type').value = '';
  document.getElementById('datepicker').value = '';
  document.getElementById('reason').value = '';
  selectedUploadFile = null;
};

// Datepicker 설정
const setupDatePicker = () => {
  const datepickerElement = document.getElementById('datepicker');
  const today = new Date().toISOString().split('T')[0];
  let picker;

  const createPicker = (options = {}) => {
    if (picker) picker.destroy();
    picker = new easepick.create({
      element: datepickerElement,
      css: ['/src/easepick.css'],
      lang: 'ko-KR',
      format: 'YYYY-MM-DD',
      calendars: 1,
      plugins: [LockPlugin],
      LockPlugin: {
        minDate: today, // 오늘 이전 날짜 lock
        filter: date => {
          const day = date.getDay();
          return day === 0 || day === 6; // 주말 lock
        },
      },
      ...options,
    });
  };

  document.getElementById('absence-type').addEventListener('change', e => {
    const selectedType = e.target.value;
    datepickerElement.value = '';
    createPicker(
      selectedType === 'am-half' || selectedType === 'pm-half'
        ? {}
        : {
            autoApply: false,
            locale: { cancel: '취소', apply: '선택' },
            plugins: [RangePlugin, LockPlugin],
            RangePlugin: { tooltip: false },
          },
    );
  });

  createPicker();
};

// 초기 화면 설정
const setupAbsencePortal = (data, itemsPerPage, currentPage) => {
  renderTable(data, currentPage, itemsPerPage);
  document.querySelector('.pagination').innerHTML = createPagination(
    data.length,
    currentPage,
    itemsPerPage,
  );
  addPaginationListeners(newPage =>
    handlePageChange(newPage, data, itemsPerPage, currentPage),
  );
};

// 메인 함수
export default async function AbsencePortal() {
  const absenceTitle = createTitle('부재 내역 및 신청', 1);
  const itemsPerPage = 15; // 최대 행 갯수
  const currentPage = 1; // 진입 시 페이지네이션

  try {
    // 데이터 가져오기
    const data = await fetchAbsenceRecords();

    // 컨테이너 html
    const container = document.createElement('div');
    container.className = 'container absence-portal';
    container.innerHTML = `
      ${absenceTitle}
      <div class="table-header">
        <label for="view-filter" class="visually-hidden">조회 필터</label>
        <select id="view-filter" name="view-filter" required>
          <option value="all" selected>전체보기</option>
          <option value="am-half">오전반차</option>
          <option value="pm-half">오후반차</option>
          <option value="annual">연차</option>
          <option value="official">공가</option>
          <option value="sick">병가</option>
          <option value="alternative">대체휴가</option>
        </select>
        <button class="btn btn-solid" data-popup="lp1">부재 신청</button>
      </div>
      <div class="table-body">
        <ul class="table" role="list" aria-label="부재 목록"></ul>
      </div>
      <div class="pagination"></div>
    `;

    // 기존 내용 제거 후 컨테이너 추가, 초기화 렌더
    document.body.innerHTML = '';
    document.body.appendChild(container);
    setupAbsencePortal(data, itemsPerPage, currentPage);
    document.body.insertAdjacentHTML('beforeend', absenceApplyModal.render());

    // 필터 변경 리스너
    document.getElementById('view-filter').addEventListener('change', event => {
      filterAbsenceRecords(data, itemsPerPage, currentPage, event.target.value);
    });

    // 부재 신청 팝업 리스너
    document
      .querySelector('[data-popup="lp1"]')
      .addEventListener('click', () => {
        absenceApplyModal.open();
        setupDatePicker();
        document
          .getElementById('fileupload')
          .addEventListener('click', handleFileUpload);
      });

    // 팝업 닫기, 취소 리스너
    document
      .querySelectorAll('#closePopupBtn, #cancelApplyBtn')
      .forEach(button => {
        button.addEventListener('click', () => {
          // 닫기 전에 확인 메시지 표시
          const confirmation = confirm(
            '작성한 내용이 모두 사라집니다. 그래도 닫으시겠습니까?',
          );
          if (confirmation) {
            resetForm(); // 작성된 내용 초기화
            absenceApplyModal.close(); // 모달 닫기
          }
        });
      });

    // 부재 등록 리스너
    document
      .getElementById('confirmApplyBtn')
      .addEventListener('click', handleSubmit);
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `<div class="container absence-portal">데이터를 불러올 수 없습니다.</div>`;
  }
}
