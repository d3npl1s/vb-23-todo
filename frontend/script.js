//Переменные
const addTaskButton = document.getElementById('addtask_button');
const addTaskInput = document.getElementById('addtask_input');
const allEventsDiv = document.querySelector('.all_tasks');
const buttonSelectAll = document.getElementById('buttonSelectAll');
const buttonAllTasks = document.getElementById('button_all_tasks');
const buttonActiveTasks = document.getElementById('button_active_tasks');
const buttonComplitedTasks = document.getElementById('button_complited_tasks');
const buttonDeleteComplited = document.getElementById('button_delete_complited');
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

let filterType = FILTER_ALL;
let currentPage = 1;

//Создать массив
let arrayTasks = [];


//Самое важное!!
const render = () => {
    fixCurrentPage();
    
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
        const tag = `<div data-id="${task.id}">
            <input type="checkbox" ${task.isComplited ? 'checked' : ''} name="" id="">
            <input class="redTask" maxlength = "250" autocomplete="off" data-id="edit-task-input" hidden>
            <span data-id="text-task">${task.text}</span>
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
    render();
}

const AddTaskObject = (addTaskInput) => {
    let idNewTask = arrayTasks.length ? arrayTasks.at(-1).id + 1 : 0;
    arrayTasks.push({
        id: idNewTask,
        text: addTaskInput,
        isComplited: false
    });
    resetToDefaultPreferens();
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

const checkboxEditComplitedClick = (id) => {
    const currentTask = arrayTasks.find((task) => task.id === Number(id));
    currentTask.isComplited = !currentTask.isComplited;
    render();
};

const buttonDeleteTaskClick = (id) => {
    arrayTasks = arrayTasks.filter((task) => task.id !== Number(id));
    render();
};


const setStyleForOnFilter = () => {
    buttonAllTasks.classList.remove(CLASS_ACTIVE);
    buttonActiveTasks.classList.remove(CLASS_ACTIVE);
    buttonComplitedTasks.classList.remove(CLASS_ACTIVE);

    if(filterType === FILTER_ALL) buttonAllTasks.classList.add(CLASS_ACTIVE);
    if(filterType === FILTER_ACTIVE) buttonActiveTasks.classList.add(CLASS_ACTIVE);
    if(filterType === FILTER_COMPLITED) buttonComplitedTasks.classList.add(CLASS_ACTIVE);
};


const removeDisabledFromButtons = () => {
    buttonSelectAll.removeAttribute(DISABLED);
    buttonDeleteComplited.removeAttribute(DISABLED);
    buttonAllTasks.removeAttribute(DISABLED);
    buttonComplitedTasks.removeAttribute(DISABLED);
    buttonActiveTasks.removeAttribute(DISABLED);
};

const setDisabledForButtons = () => {
    buttonSelectAll.setAttribute(DISABLED, DISABLED);
    buttonDeleteComplited.setAttribute(DISABLED, DISABLED);
    buttonAllTasks.setAttribute(DISABLED, DISABLED);
    buttonComplitedTasks.setAttribute(DISABLED, DISABLED);
    buttonActiveTasks.setAttribute(DISABLED, DISABLED);
}

const setStyleForEmptyArray = () => {
    buttonAllTasks.classList.remove(CLASS_ACTIVE);
    buttonActiveTasks.classList.remove(CLASS_ACTIVE);
    buttonComplitedTasks.classList.remove(CLASS_ACTIVE);
};

const onClickSelectAll = () => {
    arrayTasks.forEach((task) => task.isComplited = buttonSelectAll.checked);
    render();
}

const onClickDeleteComplited = () => {
    arrayTasks = arrayTasks.filter((task) => !task.isComplited);
    render();
}

const ifAllTasksSelect = () => {
    if(arrayTasks.length > 0){
        buttonSelectAll.checked = arrayTasks.every((task) => task.isComplited);
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

const saveEditTask = (newText, id) =>{
    const currentTask = arrayTasks.find((task) => task.id === Number(id));
    currentTask.text = newText;
    render();
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
    return arrayTasks.slice(startTaskOfPage, endTaskOfPage);
};

const setPagination = () => {
    const countPages = Math.ceil(arrayTasks.length / COUNT_TASKS_ON_PAGE);

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
    const countPages = Math.ceil(arrayTasks.length/COUNT_TASKS_ON_PAGE);
    const lastPage = countPages > 0 ? countPages : 1;
    if(currentPage > lastPage) currentPage = lastPage;
};


buttonSelectAll.addEventListener('click', onClickSelectAll);
buttonDeleteComplited.addEventListener('click', onClickDeleteComplited);
allEventsDiv.addEventListener('dblclick', onDblClickListTask);
allEventsDiv.addEventListener('keyup', onKeyUpSaveEditTask);
pagination.addEventListener('click', onClickPagination);

render();