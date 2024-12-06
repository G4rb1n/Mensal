import { API_BASE_URL } from "../../config/apiConfig.js";
import { saveToLocalStorage } from "../utils/storage.js";


// Obtendo os elementos do formulário de login
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  if (!email) {
    showError("Por favor informe um email válido.");
    return;
  }

  const submitButton = loginForm.querySelector("button");
  disableButton(submitButton, true);

  try {
    const response = await fetch(`${API_BASE_URL}/GetPersonByEmail?Email=${email}`);
    if (!response.ok) {
      if (response.status === 422) {
        const errorData = await response.json();
        showError(errorData.Errors[0]);
      } else {
        showError("Aconteceu um erro inesperado, tente novamente.");
      }
      return;
    }

    const userData = await response.json();

    // Armazenando os dados no localStorage (permanente, para uso futuro)
    localStorage.setItem("user", JSON.stringify({ id: userData.Id, email: userData.Email }));

    // Armazenando os dados no sessionStorage (autenticação, durando enquanto a aba estiver aberta)
    sessionStorage.setItem("user", JSON.stringify({ id: userData.Id, email: userData.Email }));

    // Redireciona o usuário para a página de boards
    window.location.href = "taskBoard.html";
  } catch (error) {
    showError("Falha ao se conectar com o servidor. Tente novamente mais tarde");
  } finally {
    disableButton(submitButton, false);
  }
});

// Função para desabilitar o botão durante o carregamento
function disableButton(button, disable) {
  button.disabled = disable;
  button.textContent = disable ? "Carregando..." : "Acessar";
}

// Função para exibir mensagens de erro
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}