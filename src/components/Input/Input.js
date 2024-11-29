// import './input.css';

/**
 * 기본 인풋(text, password 등 텍스트 형태)
 * @param {Object} options - 옵션 객체
 * @param {string[]} [options.classList] - 클래스 목록
 * @param {string} options.id - 아이디
 * @param {string} options.type - 인풋 타입(기본: text)
 * @param {string} options.placeholder - placeholder 텍스트
 * @param {string} options.value - 인풋 초기값
 * @param {function} options.onChange - change 이벤트
 * @param {function} options.onClick - 클릭 이벤트
 */
export default function createInput({
  classList = [],
  id,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  onClick,
}) {
  const inputClickEvent = () => {
    if (onClick) {
      document.getElementById(id).addEventListener('click', onClick);
    }
  };

  // 입력 변경 이벤트를 추가하는 함수
  const inputChangeEvent = () => {
    if (onChange) {
      document.getElementById(id).addEventListener('input', onChange);
    }
  };

  const render = () => `
    <input
      id="${id}"
      class="${classList.join(' ')}"
      type="${type}"
      placeholder="${placeholder}"
      value="${value}"
    />
  `;

  return {
    inputClickEvent,
    inputChangeEvent,
    render,
  };
}
