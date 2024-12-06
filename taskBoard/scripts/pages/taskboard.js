import { API_BASE_URL } from "../../config/apiConfig.js";
import { saveToLocalStorage } from "../utils/storage.js";

// Função de tratamento de erros
async function handleError(response) {
    if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.Errors ? errorData.Errors[0] : "Erro inesperado.");
        return true;
    }
    return false;
}

document.getElementById('home').addEventListener('click', () => {
    window.location.href = 'index.html'; // Redireciona para index.html
});


document.getElementById('Emailselecionado').textContent = JSON.parse(sessionStorage.getItem("user"))?.email;
//sessionStorage.setItem("selectedBoardId", boardId);


// Seleciona o botão de alternância de tema
const themeToggle = document.getElementById('themeToggle');

// Adiciona evento de clique para alternar o tema
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme'); // Alterna a classe do corpo

  // Armazena a preferência do tema no localStorage
  const isLightTheme = document.body.classList.contains('light-theme');
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
});

// Aplica o tema salvo no localStorage ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
});

// Função para abrir o formulário de criação de board
document.querySelector('#add-board-btn').addEventListener('click', () => {
    const modal = document.getElementById('create-board-modal');
    modal.style.display = 'flex'; // Exibe o modal centralizado
});

// Fechar o modal ao clicar fora dele
window.addEventListener('click', (event) => {
    const modal = document.getElementById('create-board-modal');
    if (event.target === modal) {
        modal.style.display = 'none'; // Fecha o modal
    }
});

// Enviar dados para criar um board
document.querySelector('#create-board-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o comportamento padrão do formulário

    const name = document.querySelector('#board-name').value;

    // Verifica se o usuário está logado e pega o ID do usuário
    const userSession = sessionStorage.getItem("user");
    if (!userSession) {
        alert("Erro: Você não está logado. Por favor, faça o login.");
        return;  // Impede a criação do board se o usuário não estiver logado
    }
    const user = JSON.parse(userSession);
    const userId = user.id; // Corrigir para acessar o 'id' com 'i' minúsculo
    console.log("User ID:", userId);  // Verifique o valor de userId no console

    // Verifica se o nome do board foi preenchido
    if (!name || name.trim() === "") {
        alert("Erro: O nome do board não pode estar vazio.");
        return;
    }

    const newBoard = {
        Name: name,
        Description: "",
        HexaBackgroundColor: "",
        IsActive: true,
        CreatedBy: userId  // Garantir que CreatedBy está correto
    };

    console.log("Objeto para criação do Board:", newBoard);  // Verifique o objeto sendo enviado

    try {
        const response = await fetch(`${API_BASE_URL}/Board`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBoard)
        });

        if (await handleError(response)) return;

        const board = await response.json();
        console.log('Board criado com sucesso!');
        
        // Fechar o modal após criar o board
        document.getElementById('create-board-modal').style.display = 'none';
        loadBoards(); // Atualizar a lista de boards
    } catch (error) {
        console.log('Erro ao criar board:', error);
    }
});

// Salva o ID da board selecionada no sessionStorage
function selecionarBoard(boardId) {
    sessionStorage.setItem("selectedBoardId", boardId);
    console.log(`Board selecionada e salva no sessionStorage: ${boardId}`);
}





//Criar colunas
// Função para abrir o modal de criação de coluna
// Abrir o modal de criação de coluna
document.querySelector('#add-column-btn').addEventListener('click', () => {
    const modal = document.getElementById('create-column-modal');
    modal.style.display = 'block'; // Exibe o modal
    modal.style.display = 'flex'; // Exibe o modal centralizado
});

// Fechar o modal ao clicar fora dele
window.addEventListener('click', (event) => {
    const modal = document.getElementById('create-column-modal');
    if (event.target === modal) {
        modal.style.display = 'none'; // Fecha o modal
    }
});

// Fechar o modal ao clicar no botão de fechar
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('create-column-modal').style.display = 'none'; // Fecha o modal
});

// Enviar dados para criar uma coluna
document.querySelector('#create-column-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o comportamento padrão do formulário

    const name = document.querySelector('#column-name').value;
    const boardId = sessionStorage.getItem("selectedBoardId");
    const userSession = sessionStorage.getItem("user");

    // Validações
    if (!boardId) {
        alert("Erro: Nenhuma board foi selecionada. Por favor, selecione uma board antes de criar uma coluna.");
        return;
    }

    if (!name || name.trim() === "") {
        alert("Erro: O nome da coluna não pode estar vazio.");
        return;
    }

    if (!userSession) {
        alert("Erro: Você não está logado. Por favor, faça o login.");
        return;
    }

    const user = JSON.parse(userSession);
    const userId = user.id;

    const newColumn = {
        BoardId: boardId,
        Name: name.trim(),
        Position: 0, // Pode ser ajustado conforme necessário
        IsActive: true,
        CreatedBy: userId
    };

    try {
        const response = await fetch(`https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/Column`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newColumn)
        });

        // Verificar se houve erro na resposta
        if (await handleError(response)) return;

        if (response.ok) {
            console.log('Coluna criada com sucesso!');
            document.querySelector('#column-name').value = ""; // Limpa o campo do nome
            document.getElementById('create-column-modal').style.display = 'none'; // Fecha o modal
            loadColumns(boardId); // Atualiza a lista de colunas
        } else {
            const errorData = await response.json();
            alert(`Erro ao criar coluna: ${errorData.message || 'Erro desconhecido'}`);
        }
    } catch (error) {
        console.error('Erro ao criar coluna:', error);
        alert('Erro ao criar coluna. Por favor, tente novamente.');
    }
});



let deleteMode = false; // Variável para controlar o modo de deletar
let selectedColumnId = null; // ID da coluna selecionada


// Função para carregar as colunas
function loadColumns(boardId) {
    showTables(boardId);
    const columnsContainer = document.getElementById('columns-container');
    columnsContainer.innerHTML = ''; // Limpa as colunas existentes
}



// Função para criar e adicionar itens na lista
function createListItem(parentElement, textContent, callback) {
    const item = document.createElement('li');
    item.innerHTML = `<a>${textContent}</a>`;
    item.addEventListener('click', callback);
    parentElement.appendChild(item);
}

// Seleciona a board e salva o ID no sessionStorage
document.querySelector('#selecionar').addEventListener('click', async (event) => {
    event.preventDefault();

    const dropdownMenu = document.getElementById('boardsList');
    const colunasDiv = document.getElementById('colunas');
    const backButton = document.getElementById('backToBoards');

    // Garante que apenas a lista de boards esteja visível
    dropdownMenu.style.display = 'block';
    //colunasDiv.style.display = 'none';
    document.addEventListener('click', () => {
        dropdownContent.style.display = 'none';
    });


    // Limpa os itens existentes na lista de boards
    dropdownMenu.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/Boards`);
        if (await handleError(response)) return;

        const boardsResponse = await response.json();

        boardsResponse.forEach((board) => {
            createListItem(dropdownMenu, board.Name, () => {
               // alert(`Board selecionado: ${board.Id}`);
                
                // Salva o ID da board no sessionStorage
                sessionStorage.setItem("selectedBoardId", board.Id);
                console.log(`Board ID salvo: ${board.Id}`);  // Verifique se o ID está sendo salvo corretamente
                
                // Mostra as tabelas (colunas) da board selecionada
                showTables(board.Id);
                document.getElementById('add-column-btn').style.display = 'block';


                document.getElementById('Boardselecionado').textContent = board.Name;

                // Esconde a lista de boards
                dropdownMenu.style.display = 'none';
                
                // Adiciona o botão de voltar
                document.addEventListener('click', () => {
                    dropdownContent.style.display = 'none';
                });
            });
        });
    } catch (error) {
        console.log(error);
    }
});



async function showTables(boardId) {
    const colunasDiv = document.getElementById("colunas");
    colunasDiv.innerHTML = ''; // Limpa os itens existentes

    try {
        const response = await fetch(`${API_BASE_URL}/ColumnByBoardId?BoardId=${boardId}`);
        if (await handleError(response)) return;

        const tablesResponse = await response.json();

        tablesResponse.forEach((table) => {
            // Cria uma coluna
            const coluna = document.createElement("div");
            coluna.className = "col-individual";
        
            // Adiciona um título à coluna
            const colunaHeader = document.createElement("div");
            colunaHeader.className = "coluna-header";
            colunaHeader.innerHTML = `<h2>${table.Name}</h2>`;
            coluna.appendChild(colunaHeader);
        
            // Adiciona um contêiner de tarefas à coluna
            const tasksDiv = document.createElement("div");
            tasksDiv.id = `tasks-${table.Id}`;
            tasksDiv.className = "tasks-container";
            tasksDiv.innerHTML = "<p>Carregando tarefas...</p>";
            coluna.appendChild(tasksDiv);
        
            // Adiciona um botão de exclusão ao final da coluna
            const deleteIcon = document.createElement("button");
            deleteIcon.className = "delete-column";
            deleteIcon.innerHTML = "&#128465;"; // Ícone de exclusão (X)
            deleteIcon.title = "Excluir coluna";
            deleteIcon.onclick = async () => {
                if (confirm(`Deseja realmente excluir a coluna "${table.Name}"?`)) {
                    await deleteColumn(table.Id, coluna);
                }
            };
            coluna.appendChild(deleteIcon); // Botão de exclusão no final da coluna
        
            colunasDiv.appendChild(coluna);
        
            // Carrega as tarefas para a coluna
            showTasks(table.Id, tasksDiv);
        });

        colunasDiv.style.display = 'flex'; // Garante que as colunas sejam exibidas lado a lado
    } catch (error) {
        console.log(error);
    }
}

// Função para excluir coluna
async function deleteColumn(ColumnId, colunaElement) {
    try {

       // alert(ColumnId);

        const response = await fetch(`${API_BASE_URL}/Column?ColumnId=${ColumnId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ColumnId })
        });

        if (await handleError(response)) return;

        // Remove o elemento da coluna se a exclusão for bem-sucedida
        colunaElement.remove();
        alert("Coluna excluída com sucesso!");
    } catch (error) {
        console.log("Erro ao excluir a coluna:", error);
        alert("Não foi possível excluir a coluna.");
    }
}

async function showTasks(columnId, tasksDiv) {
    tasksDiv.innerHTML = ''; // Limpa o conteúdo anterior

    try {
        const response = await fetch(`${API_BASE_URL}/TasksByColumnId?ColumnId=${columnId}`);
        if (await handleError(response)) return;

        const tasksResponse = await response.json();
 //       alert(tasksResponse(tasksResponse));

        tasksResponse.forEach((task) => {
            // Cria uma tarefa
            const taskDiv = document.createElement("div");
            taskDiv.className = "task-individual";
            taskDiv.setAttribute("draggable", "true");
            taskDiv.innerHTML = `<p>${task.Title}</p>`;

            tasksDiv.appendChild(taskDiv);
        });
    } catch (error) {
        console.log(error);
        tasksDiv.innerHTML = "<p>Erro ao carregar tarefas.</p>";
    }
}