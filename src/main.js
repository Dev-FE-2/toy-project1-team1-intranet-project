import './reset.css';
import './style.css';

async function app() {
  document.querySelector('#app').innerHTML = `
    <div>
      index 페이지입니다
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', app);
