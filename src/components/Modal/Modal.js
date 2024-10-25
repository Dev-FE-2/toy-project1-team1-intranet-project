import './modal.css';

/**
 * 모달 생성기
 * @param {Object} options - 옵션 객체
 * @param {string[]} [options.classList] - 클래스 목록
 * @param {string} options.id - 아이디 (필수)
 * @param {string} options.title - 타이틀
 * @param {string} options.content - 본문
 * @param {string} options.buttons - 버튼(확인, 취소 등)
 */
export default function createModal(
  {
    classList = [],
    id,
    title,
    content,
    buttons
  }
) {
  const open = () => {
    const popup = document.getElementById(id);
    popup.classList.add('is-active');
    document.getElementById('dimmed').classList.add('is-active');
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    const popup = document.getElementById(id);
    popup.classList.remove('is-active');
    document.getElementById('dimmed').classList.remove('is-active');
    popup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const render = () => `
    <div class="dimmed" id="dimmed"></div>
    <div class="layer-popup ${classList ? classList.join(' ') : ''}" id="${id}">
      ${title ? `<h2 class="title">${title}</h2>` : ''}
      ${content}
      <div class="btn-box">
        ${buttons}
      </div>
    </div>
  `

  return {
    open,
    close,
    render
  };
}