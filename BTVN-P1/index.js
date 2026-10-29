
const skills = [
  "Cấu trúc Semantic HTML5",
  "Định dạng Box Model & Flexbox",
  "Thao tác cây DOM cơ bản",
  "Thuật toán xử lý mảng JavaScript",
  "Thiết kế biểu mẫu web chuẩn a11y",
  "Kỹ năng gỡ lỗi DevTools",
  "Quản lý mã nguồn với Git",
  "Tối ưu hóa hiệu năng trang web"
];

const skillListElem = document.getElementById("skill-list");

const totalSkillsElem = document.querySelector("#total-skills");


const skillInputElem = document.querySelector("#skill-input");
const logListElem = document.querySelector("#log-list");
const actionBtns = document.querySelectorAll(".btn-action");


function addLog(message) {
  const logItem = document.createElement("li");
  logItem.textContent = message;
  logListElem.appendChild(logItem);
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

const btnPush = document.getElementById("btn-push");
const btnPop = document.getElementById("btn-pop");
const btnUnshift = document.getElementById("btn-unshift");
const btnShift = document.getElementById("btn-shift");

// Nút PUSH
btnPush.addEventListener("click", () => {
  const value = skillInputElem.value.trim() || "Kỹ thuật lập trình bất đồng bộ";
  skills.push(value);
  addLog(`[push()] Thêm "${value}" vào cuối lộ trình (Hiện có ${skills.length} kỹ năng)`);
  skillInputElem.value = "";
  renderSkills();
});

// Nút POP
btnPop.addEventListener("click", () => {
  if (skills.length === 0) return;
  const removed = skills.pop();
  addLog(`[pop()] Gỡ kỹ năng cuối ("${removed}") (Hiện có ${skills.length} kỹ năng)`);
  renderSkills();
});

// Nút UNSHIFT
btnUnshift.addEventListener("click", () => {
  const value = skillInputElem.value.trim() || "Tư duy logic & giải thuật căn bản";
  skills.unshift(value);
  addLog(`[unshift()] Chèn "${value}" lên vị trí ưu tiên số 1 (Hiện có ${skills.length} kỹ năng)`);
  skillInputElem.value = "";
  renderSkills();
});

// Nút SHIFT
btnShift.addEventListener("click", () => {
  if (skills.length === 0) return;
  const removed = skills.shift();
  addLog(`[shift()] Hoàn thành và bỏ kỹ năng đầu tiên ("${removed}") (Hiện có ${skills.length} kỹ năng)`);
  renderSkills();
});


renderSkills();
addLog(`[Khởi tạo] Thiết lập lộ trình ${skills.length} kỹ năng chuẩn (Hiện có ${skills.length} kỹ năng)`);