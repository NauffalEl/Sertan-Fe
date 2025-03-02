document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".signup");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Menghentikan pengiriman formulir secara default

    const usernameInput = document.querySelector(".masukan-username");
    const emailInput = document.querySelector(".masukan-email");
    const passwordInput = document.querySelector(".masukan-password");

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // Pendaftaran berhasil
        window.location.href = '/index.html';
      } else {
        alert(data.message); // Pendaftaran gagal
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat melakukan pendaftaran");
    }
  });
});
