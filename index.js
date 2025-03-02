// index.js
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".signin");
  const usernameInput = document.querySelector(".masukan-username");
  const passwordInput = document.querySelector(".masukan-password");
  const loginButton = document.getElementById("submit");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Menghentikan perilaku default form

    const identifier = usernameInput.value; // Gunakan identifier untuk menerima username atau email
    const password = passwordInput.value;

    // Kirim data ke server untuk proses login
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: identifier,
        password: password,
      }),
    })
      .then((response) => {
        if (response.ok) {
          // Simpan identifier di Local Storage atau Session Storage
          sessionStorage.setItem("identifier", identifier);
          // Redirect ke halaman setelah login berhasil
          window.location.href = "/dashbor.html"; // Ganti dengan halaman yang sesuai
        } else {
          alert("Login gagal. Periksa kembali username/email dan password Anda.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Terjadi kesalahan. Silakan coba lagi.");
      });
  });
});
