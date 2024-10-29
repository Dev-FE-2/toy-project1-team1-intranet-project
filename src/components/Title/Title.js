/**
 * 제목 요소 생성기
 * @param {string} text - 제목으로 표시할 텍스트
 * @param {number} [level=1] - 제목의 레벨 (1에서 6까지), 기본값은 1
 * @param {string} [className='title'] - 제목에 적용할 클래스 이름, 기본값은 'title'
 * @param {string} [id=''] - 제목 요소에 적용할 고유 아이디, 기본값은 빈 문자열
 * @returns {string} HTML 형식의 제목 요소 문자열 (예: <h1 class="title">text</h1>)
 */
export default function createTitle(
  text,
  level = 1,
  className = 'title',
  id = '',
) {
  const headingLevel = Math.min(Math.max(level, 1), 6);

  return `<h${headingLevel} class="${className}" id="${id}">${text}</h${headingLevel}>`;
}
