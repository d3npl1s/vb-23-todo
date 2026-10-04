//Переменные
const addTaskButton = document.getElementById('addtask_button');
const addTaskInput = document.getElementById('addtask_input');
const allEventsDiv = document.querySelector('.all_tasks');
const buttonSelectAll = document.getElementById('buttonSelectAll');
const buttonAllTasks = document.getElementById('button_all_tasks');
const buttonActiveTasks = document.getElementById('button_active_tasks');
const buttonComplitedTasks = document.getElementById('button_complited_tasks');
const buttonDeleteComplited = document.getElementById('button_delete_complited');

const FILTER_ALL = "all";
const FILTER_ACTIVE = "active";
const FILTER_COMPLITED = "complited";
const CLASS_ACTIVE = "active";

const ENTER = "Enter";
const BUTTON = "BUTTON";
const DISABLED = "disabled"

let filterType = FILTER_ALL;

//Создать массив
let arrayTasks = [];


//Самое важное!!
const render = () => {
    if(arrayTasks.length > 0){
        setStyleForOnFilter();
        removeDisabledFromButtons();
    }else{
        setStyleForEmptyArray();
        setDisabledForButtons();
    }
    
    let AllTasks = '';
    arrayTasks.forEach((task) => {
        const tag = `<div data-id="${task.id}">
            <input type="checkbox" ${task.isComplited ? 'checked' : ''} name="" id="">
            <input class="redTask" maxlength = "250" autocomplete="off" hidden>
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

buttonSelectAll.addEventListener('click', onClickSelectAll);
buttonDeleteComplited.addEventListener('click', onClickDeleteComplited);
render();