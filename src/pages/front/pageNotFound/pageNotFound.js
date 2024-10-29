export default function pageNotFound() {
  document.body.innerHTML = `
  <div class="empty-page">
    <p>죄송합니다. <br>요청하신 페이지를 찾을 수 없습니다.</p>
    <button class="btn btn-solid" id="backButton">이전으로</button>
  </div>
  `;
  document.getElementById('backButton').addEventListener('click', () => {
    history.back();
  });
}
