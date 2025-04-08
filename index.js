const getTasksFromLocalStorage = () =>{
    //cria uma constante que pega as tasks do localStorage
    const localTasks = window.localStorage.getItem('tasks');

    //se nao houver tarefas salvas, cria uma array vazia
    if(!localTasks){
        window.localStorage.setItem('tasks', JSON.stringify([]));
        return [];
    }

    try{
        return JSON.parse(localTasks); //converte os colchetes em array
    }
    catch{
        console.error("Erro ao converter string em array", error);
        //tenta novamente
        window.localStorage.setItem('tasks', JSON.stringify([]));
        return [];
    }
}

const setTasksOnLocalStorage = (tasks)=>{
    window.localStorage.setItem('tasks', JSON.stringify(tasks));
}

const updatedTasksCounter = () => {
    const tasks = getTasksFromLocalStorage();
    const doneTasks = tasks.filter(tasks => tasks.checked).length;
    document.getElementById('done-tasks-counter').textContent=`${doneTasks} tarefa(s) concluída(s)`;
}

const removeDoneTasks = () => {
    const tasks = getTasksFromLocalStorage();
    // Identifica as tarefas concluídas e armazena os IDs
    const tasksToRemove = tasks
        .filter(({ checked }) => checked)
        .map(({ id }) => id);

    // Mantém apenas as tarefas não concluídas
    const updatedTasks = tasks.filter(({ checked }) => !checked);
    setTasksOnLocalStorage(updatedTasks);

    // Remove cada tarefa concluída do DOM
    tasksToRemove.forEach((taskToRemove) => {
        const taskElement = document.getElementById(`task-${taskToRemove}`);
        if (taskElement) {
            taskElement.remove(); // Remover diretamente o elemento
        }
    });

    updatedTasksCounter(); // Atualiza o contador de tarefas concluídas
};

const getCompleteButton = ({ id, checked }) => {
    const button = document.createElement("button");
    button.textContent = checked ? "Concluído" : "Concluir";
    button.className = "complete-btn"; // Classe para estilização
    button.disabled = checked;

    // Obtém o item da tarefa
    const taskItem = document.getElementById(`task-${id}`);
    if (checked && taskItem && !taskItem.querySelector(".check-icon")) {
        addCheckIcon(taskItem);
    }

    button.addEventListener("click", () => onCompleteClick(id, button));

    return button;
};

const onCompleteClick = (taskId, button) => {
    let tasks = getTasksFromLocalStorage();

    // Atualiza a tarefa como concluída
    tasks = tasks.map(task =>
        task.id === taskId ? { ...task, checked: true } : task
    );

    setTasksOnLocalStorage(tasks);

    // Atualiza a interface
    const taskItem = document.getElementById(`task-${taskId}`);
    if (taskItem) {
        const taskText = taskItem.querySelector(".task-text");
        if (taskText) {
            taskText.classList.add("task-completed");
        }

        // Remove o botão "Concluir"
        button.remove();

        // Adiciona uma imagem no lugar do botão
        if (!taskItem.querySelector(".check-icon")) {
            const checkIcon = document.createElement("img");
            checkIcon.src = "check.svg"; // Substitua pelo caminho correto da imagem
            checkIcon.alt = "Concluído";
            checkIcon.classList.add("check-icon"); // Adicione uma classe para estilizar no CSS
           
            const taskActions = taskItem.querySelector(".task-actions");
            taskActions.appendChild(checkIcon);
        }
    }

    updatedTasksCounter();
};

// Cria um item da lista de tarefas no HTML
const createTaskListItem = (task) => {
    const list = document.getElementById("todo-list");

    // Criando os elementos
    const toDo = document.createElement("li");
    const taskText = document.createElement("span");
    const dateInfo = document.createElement("p");
    const tag = document.createElement("span");
    const taskActions = document.createElement("div"); // Container fixo para manter alinhamento

    // Adicionando conteúdo e classes
    toDo.className = "task-item";
    taskText.textContent = task.description;
    taskText.className = "task-text";
    toDo.id = `task-${task.id}`; // Agora o ID tem um prefixo para evitar conflitos

    dateInfo.textContent = `Criado em: ${task.date}`;
    dateInfo.className = "task-date";

    tag.textContent = task.label; // Aqui pode ser dinâmico conforme a tarefa
    tag.className = "task-tag";
    taskActions.className = "task-actions";

    if (task.checked) {
        // Se a tarefa já estiver concluída, adiciona o ícone de check e remove o botão
        taskText.classList.add("task-completed");

        const checkIcon = document.createElement("img");
        checkIcon.src = "check.svg";
        checkIcon.alt = "Concluído";
        checkIcon.classList.add("check-icon");

        taskActions.appendChild(checkIcon);
    } else {
        // Se ainda não estiver concluída, adiciona o botão
        const completeButton = getCompleteButton(task);
        taskActions.appendChild(completeButton);
    }

    // Montando a estrutura da tarefa
    toDo.appendChild(taskText);
    toDo.appendChild(tag);
    toDo.appendChild(dateInfo);
    toDo.appendChild(taskActions); // Adiciona o container fixo no final

    list.appendChild(toDo);
};

// Gera um novo ID para a tarefa
const getNewTaskId = () => {
    const tasks = getTasksFromLocalStorage();
    const lastId = tasks[tasks.length - 1]?.id;
    return lastId ? parseInt(lastId) + 1 : 1;
}

// Obtém os dados da nova tarefa criada pelo usuário
const getNewTaskData = (event) => {
    const description = event.target.elements.description.value;
    const label = event.target.elements.label.value || "Sem etiqueta"; // Se não for preenchido, define um padrão
    const date = new Date().toLocaleDateString("pt-BR"); // Pega a data atual formatada (DD/MM/AAAA)
    const id = getNewTaskId();
    return {id, description, label, date};
}

// Cria uma nova tarefa
const createTask = (event) => {
    event.preventDefault(); // Evita recarregar a página
    const newTaskData = getNewTaskData(event);

    createTaskListItem(newTaskData);
   
    const tasks = getTasksFromLocalStorage();
    const updatedTasks = [
        ...tasks,
        {id: newTaskData.id, description: newTaskData.description, label: newTaskData.label, date: newTaskData.date}
    ];

    setTasksOnLocalStorage(updatedTasks);
   
    document.getElementById('description').value = ''; // Limpa o campo de entrada
    document.getElementById("label").value = ""; // Limpa o campo da etiqueta
    updatedTasksCounter(); //atualiza o contador de tarefas concluidas
}

// Quando a página carrega, inicializa as tarefas
window.onload = ()=> {
    if (!window.localStorage.getItem('tasks')) {
        window.localStorage.setItem('tasks', JSON.stringify([]));
    }
   
    const form = document.getElementById('create-todo-form');
    form.addEventListener('submit', createTask);
   
    const tasks = getTasksFromLocalStorage();

    // Adiciona as tarefas salvas ao carregar a página
    tasks.forEach((task) => {
        createTaskListItem(task);
    })

    updatedTasksCounter(); //atualiza o contador de tarefas concluidas

}
