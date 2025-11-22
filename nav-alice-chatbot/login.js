const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    alert(`Bienvenido, ${user.email}`);

    if (email.includes("empresa")) {
      window.location.href = "index.php";
    } else {
      window.location.href = "index.php";
    }
  } catch (error) {
    alert("Error al iniciar sesión: " + error.message);
  }
});

registerBtn.addEventListener('click', async () => {
  try {
    await auth.createUserWithEmailAndPassword(
      document.getElementById('email').value,
      document.getElementById('password').value
    );
    alert("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
  } catch (error) {
    alert("Error al registrar: " + error.message);
  }
});
