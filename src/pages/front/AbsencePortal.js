import axios from 'axios';
import { easepick, LockPlugin, RangePlugin } from '@easepick/bundle';
import {
  createPagination,
  addPaginationListeners,
} from '/src/components/pagination/_pagination';
import createModal from '/src/components/Modal/Modal';
// 페이지네이션 임시

// 테이블 헤더
const tableHeader = `
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

// 부재 리스트 호출
const fetchAbsenceData = async () => {
  try {
    const response = await axios.get(`/api/absence`);
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching absence data:', error);
    return [];
  }
};

// 처리 상태 기준 badge className
const getStatusBadgeClass = status => {
  switch (status) {
    case '처리완료':
      return 'badge-success';
    case '처리중':
      return 'badge-warn';
    case '반려':
      return 'badge-error';
    default:
      return '';
  }
};

// 개별 행 데이터 렌더링
const renderRow = item => {
  const badgeClass = getStatusBadgeClass(item.status); // 상태에 따른 badge 클래스 설정
  return `
    <li class="col">
      <ul class="cell" role="list">
        <li class="type">${item.type}</li>
        <li class="date">${item.date}</li>
        <li class="status">
          <div class="badge ${badgeClass}">${item.status || '-'}</div>
        </li>
        <li class="reason text-clamp">${item.reason || '-'}</li>
        <li class="etc text-clamp">${item.status === '반려' ? item.etc || '' : ''}</li>
      </ul>
    </li>
  `;
};

// 클라이언트 필터링
const filterData = (data, filter) => {
  if (filter === 'all') return data; // 전체

  const filterMapping = {
    'am-half': '오전반차',
    'pm-half': '오후반차',
    annual: '연차',
    official: '공가',
    sick: '병가',
    alternative: '대체휴가',
  };

  const mappedFilter = filterMapping[filter]; // 선택된 필터와 매칭
  return data.filter(item => item.type === mappedFilter); // 필터링된 데이터 반환
};

// 테이블 렌더링
const renderTable = (data, page, itemsPerPage) => {
  const startIndex = (page - 1) * itemsPerPage;
  const limitedData = data.slice(startIndex, startIndex + itemsPerPage);

  const renderRows =
    limitedData.length > 0
      ? limitedData.map(renderRow).join('')
      : `<li class="col"><p>부재 이력이 없습니다.</p></li>`;

  document.querySelector('.table-body ul.table').innerHTML =
    `${tableHeader} ${renderRows}`;
};

// 잔여 연차일 가져오기 임시
const num = 5.5;

// 팝업
const absenceApplyModal = createModal({
  id: 'absenceApplyModal',
  title: '부재 신청',
  content: `
    <div class="cont">
      <div class="info-box text-success">잔여 연차 <span>${num}</span>일</div>
      <form action="" method="post">
        <ul class="input-list">
          <li>
            <label for="absence-type">구분</label>
            <select class="" id="absence-type" name="absence-type" required>
              <option value="" selected disabled>휴가 종류</option>
              <option value="am-half">오전반차</option>
              <option value="pm-half">오후반차</option>
              <option value="annual">연차</option>
              <option value="official">공가</option>
              <option value="sick">병가</option>
              <option value="alternative">대체휴가</option>
            </select>
            <p class="helper-text"></p>
          </li>
          <li>
            <label for="absence-date">기간</label>
            <input class="" type="text" name="absence-date" placeholder="YYYY-MM-DD" id="datepicker" readonly>
          </li>
          <li>
            <label for="reason">사유 입력&#40;&#42;50자 이내&#41;</label>
            <textarea class="" id="reason" name="reason" placeholder="사유를 입력하세요" required maxlength="50"></textarea>
          </li>
          <li>
						<label for="file">증빙파일 첨부 &#40;&#42;.jpeg, png, 5MB 이하&#41;</label>
						<input class="" type="file" id="file" name="file" accept=".jpg, .png">
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

// 신청 버튼 클릭 핸들러
const handleSubmit = () => {
  const absenceType = document.getElementById('absence-type').value;
  const absenceDate = document.getElementById('datepicker').value;
  const reason = document.getElementById('reason').value;
  const fileInput = document.getElementById('file');
  const file =
    fileInput.files.length > 0 ? fileInput.files[0].name : '첨부된 파일 없음';

  // 필수 입력 항목 검증
  if (!absenceType || !absenceDate || !reason) {
    const missingFields = [];
    if (!absenceType) missingFields.push('휴가 구분');
    if (!absenceDate) missingFields.push('기간');
    if (!reason) missingFields.push('사유');

    alert(`다음 항목을 입력해주세요: ${missingFields.join(', ')}`);
    return;
  }

  // 삭제 필요
  console.log('휴가 종류:', absenceType);
  console.log('기간:', absenceDate);
  console.log('사유:', reason);
};

// 폼 초기화
const resetForm = () => {
  document.getElementById('absence-type').value = '';
  document.getElementById('datepicker').value = '';
  document.getElementById('reason').value = '';
  document.getElementById('file').value = '';
};

// 모달이 열리면 easepick
const setupDatePicker = () => {
  const datepickerElement = document.getElementById('datepicker');
  const today = new Date().toISOString().split('T')[0];
  let picker;

  const createPicker = (options = {}) => {
    if (picker) picker.destroy();

    picker = new easepick.create({
      element: datepickerElement,
      css: [
        'https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css',
      ],
      lang: 'ko-KR',
      format: 'YYYY-MM-DD',
      calendars: 1,
      plugins: [LockPlugin],
      LockPlugin: {
        minDate: today,
      },
      ...options,
    });
  };

  document.getElementById('absence-type').addEventListener('change', e => {
    const selectedType = e.target.value;
    datepickerElement.value = '';

    if (selectedType === 'am-half' || selectedType === 'pm-half') {
      createPicker();
    } else {
      createPicker({
        autoApply: false,
        locale: {
          cancel: '취소',
          apply: '선택',
        },
        plugins: [RangePlugin, LockPlugin],
        RangePlugin: {
          tooltip: false,
        },
      });
    }
  });

  createPicker();
};

//팝업 닫기 confirm
const handlePopupClose = () => {
  const confirmation = confirm(
    '작성중인 내용이 저장되지 않습니다. 그래도 닫으시겠습니까?',
  );
  if (confirmation) {
    resetForm();
    absenceApplyModal.close();
  } else {
    return false;
  }
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

// 테이블 재렌더링(필터 적용, 페이지네이션)
const applyFilter = (data, itemsPerPage, currentPage, filter) => {
  const filteredData = filterData(data, filter);

  if (filteredData.length === 0) currentPage = 1;

  setupAbsencePortal(filteredData, itemsPerPage, currentPage);
};

// 초기 화면
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

export default async function AbsencePortal() {
  const itemsPerPage = 15; // 최대 행 갯수
  const currentPage = 1; // 진입 시 페이지네이션

  try {
    const data = await fetchAbsenceData();

    const container = document.createElement('div');
    container.className = 'container absence-portal';
    container.innerHTML = `
      <h1 class="title">부재 내역 및 신청</h1>
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

    document.body.innerHTML = '';
    document.body.appendChild(container);

    setupAbsencePortal(data, itemsPerPage, currentPage);
    document.body.insertAdjacentHTML('beforeend', absenceApplyModal.render());

    document.getElementById('view-filter').addEventListener('change', event => {
      const filter = event.target.value;
      applyFilter(data, itemsPerPage, currentPage, filter);
    });

    document
      .querySelector('[data-popup="lp1"]')
      .addEventListener('click', () => {
        absenceApplyModal.open();
        setupDatePicker();
      });

    document
      .querySelectorAll('#closePopupBtn, #cancelApplyBtn')
      .forEach(button => {
        button.addEventListener('click', handlePopupClose);
      });

    // 신청 버튼 클릭 시 handleSubmit 실행
    document
      .getElementById('confirmApplyBtn')
      .addEventListener('click', handleSubmit);
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `<div class="container absence-portal">데이터를 불러올 수 없습니다.</div>`;
  }
}
