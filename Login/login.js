j// Hàm tạo thông báo tự động biến mất và chuyển trang (không chặn luồng)
const ThongBao = (message, redirectUrl = null, duration = 1200) => {
    // thông báo pass 
    const passDiv = document.createElement("div");
    passDiv.innerText = message;
    passDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 20px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        font-weight: 600;
        font-family: sans-serif;
        animation: fadeIn 0.3s ease;
    `;

    document.body.appendChild(passDiv);

    // Tự động ẩn thông báo và chuyển trang sau khoảng thời gian chỉ định
    setTimeout(() => {
        passDiv.style.opacity = "0";
        passDiv.style.transition = "opacity 0.3s ease";
        
        setTimeout(() => {
        passDiv.remove();
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
        }, 300);
    }, duration);
};

const ThongBaoLoi = (message, redirectUrl = null, duration = 1500) => {
  // thông báo error
    const errorDiv = document.createElement("div");
    errorDiv.innerText = message;
    errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #c41212;
    color: white;
    padding: 20px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-size: 14px;
    font-weight: 600;
    font-family: sans-serif;

  `;

    document.body.appendChild(errorDiv);
    setTimeout(() => {
        errorDiv.style.opacity = "0";
        setTimeout(() => {
        errorDiv.remove();
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
        }, 500); // Mờ dần trong 0.15s rồi xóa
    }, duration);
}


// DOM Elements
const container = document.querySelector(".container");
const logInOverlay = () => container.classList.remove("right-panel-active");
const signUpOverlay = () => container.classList.add("right-panel-active");

const nameInput = document.querySelector("#name");
const emailSignUpInput = document.querySelector("#email");
const passwordSignUpInput = document.querySelector("#password");

const emailLoginInput = document.querySelector("#emailLogin");
const passwordLoginInput = document.querySelector("#passwordLogin");

// Xử lý Đăng ký
const handleSignUp = (event) => {
    if (event) event.preventDefault();

    const nameVal = nameInput.value.trim();
    const emailVal = emailSignUpInput.value.trim();
    const passwordVal = passwordSignUpInput.value.trim();

    if (!nameVal || !emailVal || !passwordVal) {
        ThongBaoLoi("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    if (!emailVal.includes("@")) {
        ThongBaoLoi("Email không hợp lệ!");
        return;
    }

    if (passwordVal.length < 6) {
        ThongBaoLoi("Mật khẩu phải từ 6 ký tự trở lên!");
        return;
    }

    const userInfo = {
        name: nameVal,
        email: emailVal,
        password: passwordVal,
    };

    localStorage.setItem("userInfo", JSON.stringify(userInfo));

    // Thông báo rồi tự chuyển sang form đăng nhập sau 1.2 giây
    ThongBao("Đăng ký thành công! Đang chuyển sang đăng nhập...", null, 1200);
    
    setTimeout(() => {
        nameInput.value = "";
        emailSignUpInput.value = "";
        passwordSignUpInput.value = "";
        logInOverlay();
    }, 1200);
};

// Xử lý Đăng nhập
const handleLogin = (event) => {
    if (event) event.preventDefault();
    const emailVal = emailLoginInput.value.trim();
    const passwordVal = passwordLoginInput.value.trim();

    // 1. Kiểm tra đầu vào rỗng
    if (!emailVal || !passwordVal) {
        ThongBaoLoi("Vui lòng nhập đầy đủ thông tin!");
        return;
    }
    // 2. Kiểm tra admin
    if (emailVal === "admin" && passwordVal === "admin") {
        ThongBao("Đăng nhập Admin thành công!", "./../Main/main.html", 1000);
        return;
    }

    // 3. Đọc dữ liệu từ LocalStorage để kiểm tra tài khoản thường
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));

    if (!storedUser) {
        ThongBaoLoi("Tài khoản không tồn tại. Vui lòng đăng ký!");
        return;
    }

    // 4. Đăng nhập tài khoản thường
    if (emailVal === storedUser.email && passwordVal === storedUser.password) {
        ThongBao("Đăng nhập thành công! Đang vào trang chủ...", "./../Main/main.html", 1000);
    } else {
        ThongBaoLoi("Tài khoản hoặc mật khẩu không chính xác!");
    }

};