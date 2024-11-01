// import './button.css';

/**
 * 기본 버튼
 * @param {Object} options - 옵션 객체
 * @param {string[]} [options.classList] - 클래스 목록
 * @param {string} options.id - 아이디
 * @param {string} options.text - 버튼 텍스트
 * @param {string} options.type - 버튼 타입(기본: button)
 * @param {string} options.onClick - 버튼 클릭 이벤트
 */

export default function createButton({
  classList = [],
  id,
  text,
  type = 'button',
  onClick
}){

  // 버튼 onclick 이벤트
  const buttonClickEvent = () => {
    if(onClick){
      document.getElementById(id).addEventListener('click', onClick);
    }
  }
  
  // 버튼 마크업
  const render = () => `
    <button
      id="${id}"
      class="${classList.join(' ')}"
      type="${type}"
    >
      ${text}
    </button>
  `;

  return {
    buttonClickEvent,
    render
  }
}