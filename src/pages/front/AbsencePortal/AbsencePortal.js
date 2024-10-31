import { easepick, LockPlugin, RangePlugin } from '@easepick/bundle';
import { fetchCollectionData } from '@utils/fetchCollectionData';
import { saveDataToDB, uploadFileToStorage } from '@utils/saveDataToDB';
import createTitle from '@components/Title/Title';
import {
  createPagination,
  addPaginationListeners,
} from '@components/Pagination/Pagination';
import createModal from '@components/Modal/Modal';
import { ABSENCE_TYPES_LABELS } from '/src/constants/constants';

// comp 전환 필요
const TABLE_HEADER_TEMPLATE = `
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

export default async function AbsencePortal(content) {
  let selectedAbsenceFile = null;

  const loadAbsences = async () => {
    try {
      return await fetchCollectionData('absences', 'createdAt', 'desc');
    } catch (error) {
      console.error('Error fetching absence data:', error);
      return [];
    }
  };

  const getBadgeClassForStatus = status =>
    ({
      승인: 'badge-success',
      승인대기: 'badge-warn',
      반려: 'badge-error',
    })[status] || '';

  const renderTable = (absences, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAbsences = absences.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
    const rowsHtml = paginatedAbsences.length
      ? paginatedAbsences.map(renderTableRow).join('')
      : `<li class="col"><p>부재 이력이 없습니다.</p></li>`;

    document.querySelector('.table-body ul.table').innerHTML =
      `${TABLE_HEADER_TEMPLATE} ${rowsHtml}`;

    document.querySelectorAll('.table-body ul.table .cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const absenceId = cell.getAttribute('data-id');
        openDetailModal(absenceId);
      });
    });
  };

  const renderTableRow = absence => `
      <li class="col">
        <ul class="cell" role="list" data-id="${absence.id}">
          <li class="type">${ABSENCE_TYPES_LABELS[absence.absenceType] || absence.absenceType}</li>
          <li class="date">${absence.absenceDate}</li>
          <li class="status">
            <div class="badge ${getBadgeClassForStatus(absence.status)}">${absence.status || '처리중'}</div> 
          </li>
          <li class="reason text-clamp">${absence.reason || '-'}</li>
          <li class="etc text-clamp">${absence.status === '반려' ? absence.etc || '' : ''}</li>
        </ul>
      </li>
    `;

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
              <span id="file-name" class="file-name helper-text">
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

  const absenceDetailModal = createModal({
    id: 'absenceDetailModal',
    title: '부재 내역 상세정보',
    content: `
      <button type="button" class="close" aria-label="팝업 닫기" title="팝업 닫기" id="closeDetailIcon">
        <svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="8" x2="26" y2="26" stroke="black" stroke-width="1" stroke-linecap="round" />
          <line x1="8" y1="26" x2="26" y2="8" stroke="black" stroke-width="1" stroke-linecap="round" />
        </svg>
      </button>
    `,
    buttons: '',
  });

  const openDetailModal = async absenceId => {
    const absences = await loadAbsences();
    const absence = absences.find(item => item.id === absenceId);

    if (absence) {
      const detailContentHtml = `
          <div id="detail-content">
            <dl>
              <dt>구분</dt>
              <dd>${ABSENCE_TYPES_LABELS[absence.absenceType] || absence.absenceType}</dd>
              <dt>일자</dt>
              <dd>${absence.absenceDate}</dd>
              <dt>처리상태</dt>
              <dd>${absence.status}</dd>
              <dt>신청사유</dt>
              <dd>${absence.reason}</dd>
              ${absence.etc ? `<dt>비고</dt> <dd>${absence.etc}</dd>` : ''}
              ${absence.fileUrl ? `<dt>첨부파일</dt> <dd class="file-box"><img src="${absence.fileUrl}"></dd>` : ''}
            </dl>
          </div>
        `;

      if (!document.getElementById('absenceDetailModal')) {
        document.body.insertAdjacentHTML(
          'beforeend',
          absenceDetailModal.render(),
        );
      }

      document
        .getElementById('absenceDetailModal')
        .querySelector('.btn-box')
        .insertAdjacentHTML('beforebegin', detailContentHtml);
      absenceDetailModal.open();
    } else {
      document
        .getElementById('absenceDetailModal')
        .querySelector('#detail-content').innerHTML =
        '해당 부재 정보를 찾을 수 없습니다.';
      absenceDetailModal.open();
    }

    document.getElementById('closeDetailIcon').addEventListener('click', () => {
      document
        .getElementById('absenceDetailModal')
        .querySelector('#detail-content')
        ?.remove();
      absenceDetailModal.close();
    });
  };

  const checkAbsenceOverlap = async (absenceDate, absenceType) => {
    const existingRecords = await loadAbsences();

    return existingRecords.some(record => {
      if (!record.absenceDate) return false;
      const [recordStart, recordEnd] = record.absenceDate.split(' - ');
      const [newStart, newEnd] = absenceDate.split(' - ');

      return (
        newStart <= recordEnd &&
        newEnd >= recordStart &&
        record.absenceType === absenceType
      );
    });
  };

  const resetForm = () => {
    document.getElementById('absence-type').value = '';
    document.getElementById('datepicker').value = '';
    document.getElementById('reason').value = '';
    document.getElementById('file-name').textContent = '';
    selectedAbsenceFile = null;

    const fileUploadButton = document.getElementById('fileupload');
    fileUploadButton.classList.remove('is-disabled');
    fileUploadButton.removeAttribute('disabled');
  };

  const handleFileUpload = event => {
    event.preventDefault();
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg';

    fileInput.addEventListener('change', event => {
      selectedAbsenceFile = event.target.files[0];
      if (selectedAbsenceFile) {
        const validTypes = ['image/png', 'image/jpeg'];
        const maxSize = 5 * 1024 * 1024;

        if (
          !validTypes.includes(selectedAbsenceFile.type) ||
          selectedAbsenceFile.size > maxSize
        ) {
          alert('PNG 또는 JPG, 5MB 이하 파일만 첨부 가능합니다.');
          selectedAbsenceFile = null;
        } else {
          document.getElementById('file-name').textContent =
            selectedAbsenceFile.name;
          const fileUploadButton = document.getElementById('fileupload');
          fileUploadButton.classList.add('is-disabled');
          fileUploadButton.setAttribute('disabled', 'true');
        }
      }
    });

    fileInput.click();
  };

  const handleAbsenceSubmit = async () => {
    const absenceType = document.getElementById('absence-type').value;
    const absenceDate = document.getElementById('datepicker').value;
    const reason = document.getElementById('reason').value;

    if (!absenceType || !absenceDate || !reason) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    const isOverlap = await checkAbsenceOverlap(absenceDate, absenceType);
    if (isOverlap) {
      alert('이미 신청한 날입니다.');
      return;
    }

    const fileUrl = selectedAbsenceFile
      ? await uploadFileToStorage(
          `absence-files/${Date.now()}_${selectedAbsenceFile.name}`,
          selectedAbsenceFile,
        )
      : null;

    const newAbsenceRecord = {
      absenceType,
      absenceDate,
      reason,
      fileUrl,
      status: '승인대기',
      createdAt: new Date(),
    };

    try {
      await saveDataToDB('absences', newAbsenceRecord);
      alert('신청이 완료되었습니다.');
      resetForm();
      absenceApplyModal.close();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('부재 신청에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const setupDatePicker = () => {
    const datepickerElement = document.getElementById('datepicker');
    const today = new Date().toISOString().split('T')[0];
    let datepickerInstance;

    const createDatePicker = (options = {}) => {
      if (datepickerInstance) datepickerInstance.destroy();
      datepickerInstance = new easepick.create({
        element: datepickerElement,
        css: ['/src/easepick.css'],
        lang: 'ko-KR',
        format: 'YYYY-MM-DD',
        calendars: 1,
        plugins: [LockPlugin],
        LockPlugin: {
          minDate: today,
          filter: date => date.getDay() === 0 || date.getDay() === 6,
        },
        ...options,
      });
    };

    document
      .getElementById('absence-type')
      .addEventListener('change', event => {
        const selectedType = event.target.value;
        datepickerElement.value = '';
        createDatePicker(
          selectedType === 'am-half' || selectedType === 'pm-half'
            ? {}
            : {
                plugins: [RangePlugin, LockPlugin],
                RangePlugin: { tooltip: false },
              },
        );
      });
    createDatePicker();
  };

  const filterAbsences = (absences, itemsPerPage, currentPage, filter) => {
    const filteredRecords =
      filter === 'all'
        ? absences
        : absences.filter(
            absence =>
              ABSENCE_TYPES_LABELS[absence.absenceType] ===
              ABSENCE_TYPES_LABELS[filter],
          );

    renderTable(filteredRecords, currentPage, itemsPerPage);
    document.querySelector('.pagination').innerHTML = createPagination(
      filteredRecords.length,
      currentPage,
      itemsPerPage,
    );
    addPaginationListeners(newPage =>
      handlePageChange(newPage, filteredRecords, itemsPerPage),
    );
  };

  const handlePageChange = (page, data, itemsPerPage) => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;

    renderTable(data, page, itemsPerPage);
    document.querySelector('.pagination').innerHTML = createPagination(
      data.length,
      page,
      itemsPerPage,
    );
    addPaginationListeners(newPage =>
      handlePageChange(newPage, data, itemsPerPage),
    );
  };

  const initializeAbsencePortal = (data, itemsPerPage, currentPage) => {
    renderTable(data, currentPage, itemsPerPage);
    document.querySelector('.pagination').innerHTML = createPagination(
      data.length,
      currentPage,
      itemsPerPage,
    );
    addPaginationListeners(newPage =>
      handlePageChange(newPage, data, itemsPerPage),
    );
  };

  const itemsPerPage = 15;
  const currentPage = 1;

  try {
    const absences = await loadAbsences();
    const container = document.createElement('div');
    container.className = 'container absence-portal';
    container.innerHTML = `
      ${createTitle('부재 내역 및 신청', 1)}
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

    content.innerHTML = '';
    content.appendChild(container);
    initializeAbsencePortal(absences, itemsPerPage, currentPage);
    content.insertAdjacentHTML('beforeend', absenceApplyModal.render());

    document.getElementById('view-filter').addEventListener('change', event => {
      filterAbsences(absences, itemsPerPage, currentPage, event.target.value);
    });

    document
      .querySelector('[data-popup="lp1"]')
      .addEventListener('click', () => {
        absenceApplyModal.open();
        setupDatePicker();
        document
          .getElementById('fileupload')
          .addEventListener('click', handleFileUpload);
      });

    document
      .querySelectorAll('#closePopupBtn, #cancelApplyBtn')
      .forEach(button => {
        button.addEventListener('click', () => {
          const confirmClose = confirm(
            '작성한 내용이 모두 사라집니다. 그래도 닫으시겠습니까?',
          );
          if (confirmClose) {
            resetForm();
            absenceApplyModal.close();
          }
        });
      });

    document
      .getElementById('confirmApplyBtn')
      .addEventListener('click', handleAbsenceSubmit);
  } catch (error) {
    console.error(error);
    content.innerHTML = `<div class="container absence-portal">데이터를 불러올 수 없습니다.</div>`;
  }
}
