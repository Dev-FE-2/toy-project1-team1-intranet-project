import axios from 'axios';
import {
  createPagination,
  addPaginationListeners,
} from '/src/components/pagination/_pagination';
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
  let currentPage = 1; // 진입 시 페이지네이션

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

    // 필터 이벤트 리스너
    document.getElementById('view-filter').addEventListener('change', event => {
      const filter = event.target.value;
      applyFilter(data, itemsPerPage, currentPage, filter);
    });

    // 초기 화면 호출
    setupAbsencePortal(data, itemsPerPage, currentPage);
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `<div class="container absence-portal">데이터를 불러올 수 없습니다.</div>`;
  }
}
