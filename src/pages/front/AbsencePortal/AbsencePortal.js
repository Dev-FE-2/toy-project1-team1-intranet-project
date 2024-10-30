import { easepick, LockPlugin, RangePlugin } from '@easepick/bundle';
import { fetchCollectionData } from '@utils/fetchCollectionData';
import { saveDataToDB, uploadFileToStorage } from '@utils/saveDataToDB';
import {
  createPagination,
  addPaginationListeners,
} from '@components/Pagination/Pagination';
import createModal from '@components/Modal/Modal';
import createTitle from '@components/Title/Title';

export default async function AbsencePortal(content) {
  let selectedFile = null;

  const fetchAbsences = async () => {
    try {
      return await fetchCollectionData('absences', 'createdAt', 'desc');
    } catch (error) {
      console.error('Error fetching absence data:', error);
      return [];
    }
  };

  const getBadgeClassForStatus = status => {
    return (
      {
        승인: 'badge-success',
        승인대기: 'badge-warn',
        반려: 'badge-error',
      }[status] || ''
    );
  };

  const renderTable = (absences, currentPage, itemsPerPage) => {
    const TABLE_HEADER_HTML = `
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
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAbsences = absences.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
    const rowsHtml = paginatedAbsences.length
      ? paginatedAbsences.map(renderTableRow).join('')
      : `<li class="col"><p>부재 이력이 없습니다.</p></li>`;

    document.querySelector('.table-body ul.table').innerHTML =
      `${TABLE_HEADER_HTML} ${rowsHtml}`;
  };

  const renderTableRow = absence => {
    const ABSENCE_TYPE_LABELS = {
      'am-half': '오전반차',
      'pm-half': '오후반차',
      annual: '연차',
      official: '공가',
      sick: '병가',
      alternative: '대체휴가',
    };
    return `
      <li class="col">
        <ul class="cell" role="list">
          <li class="type">${ABSENCE_TYPE_LABELS[absence.absenceType] || absence.absenceType}</li>
          <li class="date">${absence.absenceDate}</li>
          <li class="status">
            <div class="badge ${getBadgeClassForStatus(absence.status)}">${absence.status || '처리중'}</div> 
          </li>
          <li class="reason text-clamp">${absence.reason || '-'}</li>
          <li class="etc text-clamp">${absence.status === '반려' ? absence.etc || '' : ''}</li>
        </ul>
      </li>
    `;
  };

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

  const isDateRangeOverlapping = (start1, end1, start2, end2) => {
    return (start1 <= end2 && end1 >= start2) || start1 === start2;
  };

  const checkAbsenceOverlap = async (absenceDate, absenceType) => {
    const existingRecords = await fetchAbsences();

    return existingRecords.some(record => {
      if (!record.absenceDate) return false;
      const [recordStart, recordEnd] = record.absenceDate.split(' - ');
      const [newStart, newEnd] = absenceDate.split(' - ');

      return (
        isDateRangeOverlapping(
          newStart || absenceDate,
          newEnd || newStart || absenceDate,
          recordStart,
          recordEnd || recordStart,
        ) && record.absenceType === absenceType
      );
    });
  };

  const resetForm = () => {
    document.getElementById('absence-type').value = '';
    document.getElementById('datepicker').value = '';
    document.getElementById('reason').value = '';
    selectedFile = null;
  };

  const handleFileUpload = event => {
    event.preventDefault();
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg';

    fileInput.addEventListener('change', event => {
      selectedFile = event.target.files[0];
      if (selectedFile) {
        const validTypes = ['image/png', 'image/jpeg'];
        const maxSize = 5 * 1024 * 1024;

        if (
          !validTypes.includes(selectedFile.type) ||
          selectedFile.size > maxSize
        ) {
          alert('PNG 또는 JPG, 5MB 이하 파일만 첨부 가능합니다.');
          selectedFile = null;
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

    const fileUrl = selectedFile
      ? await uploadFileToStorage(
          `absence-files/${Date.now()}_${selectedFile.name}`,
          selectedFile,
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
        : absences.filter(absence => {
            const ABSENCE_TYPE_LABELS = {
              'am-half': '오전반차',
              'pm-half': '오후반차',
              annual: '연차',
              official: '공가',
              sick: '병가',
              alternative: '대체휴가',
            };
            return (
              ABSENCE_TYPE_LABELS[absence.absenceType] ===
              ABSENCE_TYPE_LABELS[filter]
            );
          });

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
    const absences = await fetchAbsences();
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
