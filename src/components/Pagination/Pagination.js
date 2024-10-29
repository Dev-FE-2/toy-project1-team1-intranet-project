/**
 * 페이지네이션 생성기
 * @param {number} totalItems - 전체 아이템 개수
 * @param {number} currentPage - 현재 페이지 번호
 * @param {number} itemsPerPage - 페이지당 아이템 개수
 * @returns {string} HTML 형식의 페이지네이션 요소 문자열
 */
export const createPagination = (totalItems, currentPage, itemsPerPage) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let paginationHTML = '';
  const maxVisiblePages = 5; // 표시될 최대 페이지네이션 갯수

  let startPage =
    Math.floor((currentPage - 1) / maxVisiblePages) * maxVisiblePages + 1;
  let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  // 이전 페이지 버튼 (1보다 작으면 disabled)
  paginationHTML += `
    <li class="paging-item prev">
      <button type="button" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}" aria-label="이전 페이지">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 34 34">
          <line x1="20" y1="6" x2="12" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
          <line x1="12" y1="17" x2="20" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
        </svg>
      </button>
    </li>
  `;

  // 페이지 번호 버튼
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <li class="paging-item ${i === currentPage ? 'is-active' : ''}">
        <button type="button" data-page="${i}">${i}</button>
      </li>
    `;
  }

  // 다음 페이지 버튼 (전체 페이지 수를 넘으면 disabled)
  paginationHTML += `
    <li class="paging-item next">
      <button type="button" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}" aria-label="다음 페이지">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 34 34">
          <line x1="14" y1="6" x2="22" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
          <line x1="22" y1="17" x2="14" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
        </svg>
      </button>
    </li>
  `;

  return `
    <ul class="paging-list" role="list">
      ${paginationHTML}
    </ul>
  `;
};

export const addPaginationListeners = onPageChange => {
  document.querySelectorAll('.paging-item button').forEach(button => {
    button.addEventListener('click', event => {
      const targetPage = parseInt(
        event.target.closest('button').dataset.page,
        10,
      );

      onPageChange(targetPage);
    });
  });
};
