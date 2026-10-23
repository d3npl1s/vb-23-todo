// ============================================================
// frontend/script.js  —  ИЗМЕНЕНО 23.10.2026: подключили backend.
//
// Что поменялось в ЭТОМ файле:
//   1. Добавлена связка с сервером через fetch (константа API_URL).
//   2. Все изменения данных (добавить / отметить / удалить /
//      сохранить текст / Select all / Delete complited) теперь
//      идут НА СЕРВЕР, а не правят локальный arrayTasks.
//   3. arrayTasks теперь «витрина»: заполняется только из ответа
//      сервера в loadTasks(). Прямые push/filter/find по нему убраны —
//      старый код оставлен ЗАКОММЕНТИРОВАННЫМ внутри функций.
//   4. Поле задачи переименовано: isComplited -> completed,
//      чтобы совпадать с сервером (сервер хранит completed).
//   5. Исправлена опечатка в focusout (лишняя кириллица "п").
// ============================================================

//Переменные
const addTaskButton = document.getElementById('addtask_button');
const addTaskInput = document.getElementById('addtask_input');
const allEventsDiv = document.querySelector('.all_tasks');
const buttonSelectAll = document.getElementById('buttonSelectAll');
const buttonFilterAllTasks = document.getElementById('button_all_tasks');
const buttonFilterActiveTasks = document.getElementById('button_active_tasks');
const buttonFilterComplitedTasks = document.getElementById('button_complited_tasks');
const buttonDeleteComplited = document.getElementById('button_delete_complited');
const sectionFilterTasks = document.querySelector('.files');
const pagination = document.getElementById('pagination');

const FILTER_ALL = "all";
const FILTER_ACTIVE = "active";
const FILTER_COMPLITED = "complited";
const CLASS_ACTIVE = "active";
const COUNT_TASKS_ON_PAGE = 5;

const ENTER = "Enter";
const BUTTON = "BUTTON";
const DISABLED = "disabled";
const ESCAPE = "Escape";
const DATA_ID = "data-id";

// Адрес сервера (backend). Сервер должен быть запущен: node server.js
const API_URL = "http://localhost:3000";

let filterType = FILTER_ALL;
let currentPage = 1;

//Создать массив (теперь это «витрина»: наполняется только с сервера)
let arrayTasks = [];

// Загрузить список задач с сервера и нарисовать.
// Это единственное место, где arrayTasks получает данные.
const loadTasks = async () => {
    try {
        const response = await fetch(API_URL + "/tasks");
        arrayTasks = await response.json();
        render();
    } catch (error) {
        console.error("Не удалось получить задачи с сервера. Проверь, что сервер запущен (node server.js):", error);
    }
};

//Самое важное!!
const render = () => {
    fixCurrentPage();
    getCounterFilterTasks();
    if(arrayTasks.length > 0){
        setStyleForOnFilter();
        removeDisabledFromButtons();
    }else{
        setStyleForEmptyArray();
        setDisabledForButtons();
    }

    ifAllTasksSelect();
    setPagination();

    let AllTasks = '';


    getTasksForCurrentPage().forEach((task) => {
            const tag = `<div class="render_" data-id="${task.id}">
                <input type="checkbox" ${task.completed ? 'checked' : ''} name="" id="">
                <input class="redTask" maxlength = "250" autocomplete="off" data-id="edit-task-input" hidden>
                <span data-id="text-task" class="render_span">${task.text}</span>
                <button class="button_delete_onetask" data-id="button_delete_onetask">X</button>
            </div>`;
            AllTasks += tag;
        })
    allEventsDiv.innerHTML = AllTasks;
};

const ClickAddTask = () => {
    const allEventsDivAdd = addTaskInput.value;
    addTaskInput.value = "";
    AddTaskObject(allEventsDivAdd);
}

const resetToDefaultPreferens = () =>{
    filterType = FILTER_ALL;
    buttonSelectAll.checked = false;
    // БЫЛО: render(); — теперь рисует loadTasks() (данные приходят с сервера)
}

const AddTaskObject = async (addTaskInput) => {
    // БЫЛО (добавление прямо в локальный массив):
    // let idNewTask = arrayTasks.length ? arrayTasks.at(-1).id + 1 : 0;
    // arrayTasks.push({
    //     id: idNewTask,
    //     text: addTaskInput,
    //     isComplited: false
    // });
    // resetToDefaultPreferens();

    // СТАЛО (сохраняем задачу на сервере, id сервер выдаст сам):
    await fetch(API_URL + "/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: addTaskInput, completed: false })
    });

    resetToDefaultPreferens();
    await loadTasks();
}


const onKeyUpInput = (event)  => {
    const keycode = event.code;
    if(keycode === ENTER){
        const allEventsDivAdd = addTaskInput.value;
        addTaskInput.value = "";
        AddTaskObject(allEventsDivAdd);
    }
}
addTaskButton.addEventListener('click', ClickAddTask);

addTaskInput.addEventListener('keyup', onKeyUpInput);



const onClickListTask = (event) => {
    const tag = event.target;
    const parent = tag.parentElement
    const id = parent.getAttribute('data-id');

    if(tag.type === "checkbox") checkboxEditComplitedClick(id);
    if(tag.tagName === BUTTON) buttonDeleteTaskClick(id);
};

allEventsDiv.addEventListener('click', onClickListTask);

const checkboxEditComplitedClick = async (id) => {
    // БЫЛО (правка в локальном массиве):
    // const currentTask = arrayTasks.find((task) => task.id === Number(id));
    // currentTask.isComplited = !currentTask.isComplited;
    // render();

    // СТАЛО (отправляем изменение на сервер через PATCH):
    const currentTask = arrayTasks.find((task) => task.id === Number(id));
    await fetch(API_URL + "/tasks/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentTask.completed })
    });
    await loadTasks();
};

const buttonDeleteTaskClick = async (id) => {
    // БЫЛО (удаление из локального массива):
    // arrayTasks = arrayTasks.filter((task) => task.id !== Number(id));
    // render();

    // СТАЛО (удаляем на сервере):
    await fetch(API_URL + "/tasks/" + id, { method: "DELETE" });
    await loadTasks();
};


const setStyleForOnFilter = () => {
    buttonFilterAllTasks.classList.remove(CLASS_ACTIVE);
    buttonFilterActiveTasks.classList.remove(CLASS_ACTIVE);
    buttonFilterComplitedTasks.classList.remove(CLASS_ACTIVE);

    if(filterType === FILTER_ALL) buttonFilterAllTasks.classList.add(CLASS_ACTIVE);
    if(filterType === FILTER_ACTIVE) buttonFilterActiveTasks.classList.add(CLASS_ACTIVE);
    if(filterType === FILTER_COMPLITED) buttonFilterComplitedTasks.classList.add(CLASS_ACTIVE);
};


const removeDisabledFromButtons = () => {
    buttonSelectAll.removeAttribute(DISABLED);
    buttonDeleteComplited.removeAttribute(DISABLED);
    buttonFilterAllTasks.removeAttribute(DISABLED);
    buttonFilterComplitedTasks.removeAttribute(DISABLED);
    buttonFilterActiveTasks.removeAttribute(DISABLED);
};

const setDisabledForButtons = () => {
    buttonSelectAll.setAttribute(DISABLED, DISABLED);
    buttonDeleteComplited.setAttribute(DISABLED, DISABLED);
    buttonFilterAllTasks.setAttribute(DISABLED, DISABLED);
    buttonFilterComplitedTasks.setAttribute(DISABLED, DISABLED);
    buttonFilterActiveTasks.setAttribute(DISABLED, DISABLED);
}

const setStyleForEmptyArray = () => {
    buttonFilterAllTasks.classList.remove(CLASS_ACTIVE);
    buttonFilterActiveTasks.classList.remove(CLASS_ACTIVE);
    buttonFilterComplitedTasks.classList.remove(CLASS_ACTIVE);
};

const onClickSelectAll = async () => {
    // БЫЛО (помечали все задачи в локальном массиве):
    // arrayTasks.forEach((task) => task.isComplited = buttonSelectAll.checked);
    // render();

    // СТАЛО (bulk-эндпоинта в задании нет, поэтому PATCH на каждую задачу):
    const completed = buttonSelectAll.checked;
    for (const task of arrayTasks) {
        await fetch(API_URL + "/tasks/" + task.id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: completed })
        });
    }
    await loadTasks();
}

const onClickDeleteComplited = async () => {
    // БЫЛО (фильтровали локальный массив):
    // arrayTasks = arrayTasks.filter((task) => !task.isComplited);
    // render();

    // СТАЛО (удаляем выполненные на сервере):
    await fetch(API_URL + "/tasks/completed", { method: "DELETE" });
    await loadTasks();
}

const ifAllTasksSelect = () => {
    if(arrayTasks.length > 0){
        buttonSelectAll.checked = arrayTasks.every((task) => task.completed);
    }else{
        buttonSelectAll.checked = false;
    }
};

const onDblClickListTask = (event) => {
    const tag = event.target;
    let dataIdTag = tag?.getAttribute('data-id');
    if(dataIdTag === 'text-task') editTextTask(tag);
};

const editTextTask = (tag) => {
    const currentTextTask = tag.textContent;
    const hiddenInput = tag.previousElementSibling;
    tag.hidden = true;
    hiddenInput.hidden = false;
    hiddenInput.value = currentTextTask;
    hiddenInput.focus();
}

const saveEditTask = async (newText, id) =>{
    // БЫЛО (правили текст в локальном массиве через find):
    // const currentTask = arrayTasks.find((task) => task.id === Number(id));
    // currentTask.text = newText;
    // render();

    // СТАЛО (сохраняем новый текст на сервере):
    await fetch(API_URL + "/tasks/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText })
    });
    await loadTasks();
}

const onKeyUpSaveEditTask = (event) => {
    const tag = event.target;
    const dataIdTag = tag.getAttribute(DATA_ID);
    if(event.code === ENTER && dataIdTag === "edit-task-input") {
        saveEditTask(tag.value, tag.parentElement.getAttribute(DATA_ID));
    };
    if(event.code === ESCAPE) return render();
};

const getTasksForCurrentPage = () => {
    const startTaskOfPage = (currentPage - 1) * 5;
    const endTaskOfPage = startTaskOfPage + COUNT_TASKS_ON_PAGE;
    return getFilteredTasks().slice(startTaskOfPage, endTaskOfPage);
};

const setPagination = () => {
    const countPages = Math.ceil(getFilteredTasks().length / COUNT_TASKS_ON_PAGE);

    let buttons = '';
    for(let i = 1; i <= countPages; i++){
        buttons += `<button class='page-button ${i === currentPage ? " " + CLASS_ACTIVE : " "}'>${i}</button>`
    }

    pagination.innerHTML = buttons;
}

const onClickPagination = (event) => {
    const tag = event.target;
    if(tag.tagName !== BUTTON) return;
    currentPage = Number(tag.textContent);
    render();
};

const fixCurrentPage = () => {
    const countPages = Math.ceil(getFilteredTasks().length/COUNT_TASKS_ON_PAGE);
    const lastPage = countPages > 0 ? countPages : 1;
    if(currentPage > lastPage) currentPage = lastPage;
};

const onClickSelectFilter = (event) => {
    const tag = event.target;
    if(tag.tagName !== BUTTON){
        return;
    }
    if(tag.id === 'button_all_tasks'){
        filterType = FILTER_ALL;
    }
    if(tag.id === 'button_active_tasks') {
        filterType = FILTER_ACTIVE;

    }
    if(tag.id === 'button_complited_tasks') {
        filterType = FILTER_COMPLITED;
    }
    setStyleForOnFilter();
    currentPage = 1;
    render();
}

const getFilteredTasks = () => {
    if(filterType === FILTER_ACTIVE){
        return arrayTasks.filter((task) => !task.completed);

    }
    if(filterType === FILTER_COMPLITED){
        return arrayTasks.filter((task) => task.completed);
    }
    return arrayTasks;
}

const getCounterFilterTasks = () => {
    buttonFilterAllTasks.textContent = `all (${arrayTasks.length})`;
    buttonFilterActiveTasks.textContent = `active (${arrayTasks.filter((task) => !task.completed).length})`;
    buttonFilterComplitedTasks.textContent = `complited (${arrayTasks.filter((task) => task.completed).length})`;
}


buttonSelectAll.addEventListener('click', onClickSelectAll);
buttonDeleteComplited.addEventListener('click', onClickDeleteComplited);
allEventsDiv.addEventListener('dblclick', onDblClickListTask);
allEventsDiv.addEventListener('keyup', onKeyUpSaveEditTask);
pagination.addEventListener('click', onClickPagination);
sectionFilterTasks.addEventListener('click', onClickSelectFilter);
allEventsDiv.addEventListener('focusout', (event) => {
      const tag = event.target;
      if(tag.getAttribute(DATA_ID) === 'edit-task-input'){
          render();
      }
  });

// render();  // БЫЛО — стартовали с пустого локального массива
loadTasks();  // СТАЛО — при открытии страницы грузим задачи с сервера
