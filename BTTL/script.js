

// DOM ELEMENTS
const cardContainer = document.getElementById('card-container');
const totalSessionsElem = document.getElementById('card-item');
const searchInput = document.getElementById('search-input');
const noResultsMsg = document.getElementById('no-results');
const themeToggleBtn = document.getElementById('theme-toggle');
const menuToggleBtn = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
const btnPush = document.getElementById('btn-push');
const btnUnshift = document.getElementById('btn-unshift');





function updateTotalCount() {
  const cards = cardContainer.querySelectorAll('.card');

  if (totalSessionsElem) {
    totalSessionsElem.textContent = cards.length;
  }
}


function reindexSessions() {
  const cards = cardContainer.querySelectorAll('.card');
  cards.forEach((card, index) => {
    const sessionHeader = card.querySelector('.card-content h3');
    if (sessionHeader) {
      sessionHeader.textContent = `Buổi ${index + 1}`;
    }
  });
}

function renderSkills() {
 
  skillListElem.innerHTML = "";
  skills.forEach((skill, index) => {
    const li = document.createElement("li");
    li.className = "skill-item";
    
    li.innerHTML = `
      <span>${index + 1}. ${skill}</span>
      <span class="module-tag">Module ${index + 1}</span>
    `;
    
    skillListElem.appendChild(li);
  });

  totalSkillsElem.textContent = skills.length;
}


function attachCardEvents(card) {
  // Yêu cầu 1: Nút "Xem chi tiết" / "Thu gọn"
  const btnDetail = card.querySelector('.btn-detail');
  if (btnDetail) {
    btnDetail.addEventListener('click', function() {
      const cardContent = this.previousElementSibling;
      const detailText = cardContent.querySelector('.card-detail');

      detailText.classList.toggle('show');
      this.textContent = detailText.classList.contains('show') ? 'Thu gọn' : 'Xem chi tiết';
    });
  }

  // Yêu cầu 4: Hiệu ứng rê chuột (mouseover & mouseout)
  card.addEventListener('mouseover', function() {
    this.classList.add('card-hovered');
  });

  card.addEventListener('mouseout', function() {
    this.classList.remove('card-hovered');
  });
}

// Gắn sự kiện cho toàn bộ thẻ bài học có sẵn trong HTML ban đầu
document.querySelectorAll('.card').forEach(card => attachCardEvents(card));


// --------------------------------------------------------------------------
// 3. THÊM BUỔI HỌC MỚI (CHỨC NĂNG PUSH & UNSHIFT)
// --------------------------------------------------------------------------
function createCardElement(sessionNum, titleText, detailText) {
  const newCard = document.createElement('div');
  newCard.className = 'card';
  newCard.innerHTML = `
    <div class="card-content">
      <h3>Buổi ${sessionNum}</h3>
      <h2>${titleText}</h2>
      <div class="card-detail">${detailText}</div>
    </div>
    <button class="btn-detail">Xem chi tiết</button>
  `;
  
  // Tự động gắn sự kiện Click & Hover cho thẻ mới
  attachCardEvents(newCard);
  return newCard;
}

// Thêm vào CỦỐI danh sách (Tương tự Array.push)
if (btnPush) {
  btnPush.addEventListener('click', function() {
    const total = cardContainer.querySelectorAll('.card').length + 1;
    const title = prompt('Nhập tên nội dung buổi học mới:', `Nâng cao JavaScript phần ${total}`);
    
    if (title) {
      const detail = prompt('Nhập mô tả chi tiết:', 'Nội dung thực hành DOM và sự kiện nâng cao.');
      const newCard = createCardElement(total, title, detail || 'Chưa có mô tả chi tiết.');
      cardContainer.appendChild(newCard); // Thêm vào cuối DOM
      updateTotalCount();
    }
  });
}

// Thêm vào ĐẦU danh sách (Tương tự Array.unshift)
if (btnUnshift) {
  btnUnshift.addEventListener('click', function() {
    const title = prompt('Nhập tên nội dung buổi học mới (thêm vào đầu):', 'Ôn tập & Khởi động');
    
    if (title) {
      const detail = prompt('Nhập mô tả chi tiết:', 'Chuẩn bị kiến thức nền tảng trước khi bắt đầu.');
      const newCard = createCardElement(1, title, detail || 'Chưa có mô tả chi tiết.');
      cardContainer.prepend(newCard); // Thêm vào đầu DOM
      reindexSessions();
      updateTotalCount();
    }
  });
}



function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}


function updateThemeBtnState() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  if (themeToggleBtn) {
    themeToggleBtn.textContent = isDarkMode ? 'Chế độ sáng' : 'Chế độ tối';
  }
  console.log(`[Theme Switcher]: Đã chuyển sang ${isDarkMode ? 'Dark Mode' : 'Light Mode'}`);
}


if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', toggleDarkMode);
  themeToggleBtn.addEventListener('click', updateThemeBtnState);
}


if (menuToggleBtn && navLinks) {
  menuToggleBtn.addEventListener('click', function() {
    navLinks.classList.toggle('active');
  });
}


if (searchInput) {
  // Dùng sự kiện 'input' để nhận phản hồi tìm kiếm thời gian thực (kể cả khi bấm Xóa/Backspace)
  searchInput.addEventListener('input', function() {
    const keyword = searchInput.value.toLowerCase().trim();
    const currentCards = cardContainer.querySelectorAll('.card');
    let hasMatches = false;

    currentCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(keyword)) {
        card.style.display = 'flex';
        hasMatches = true;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResultsMsg) {
      noResultsMsg.style.display = hasMatches ? 'none' : 'block';
    }
  });
}


// Khởi tạo
updateTotalCount();
updateThemeBtnState();
