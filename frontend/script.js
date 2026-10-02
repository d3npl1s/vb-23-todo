//Переменные
const addtask_button = document.getElementById('addtask_button');
const addtask_input = document.getElementById('addtask_input');
const allevents_div = document.getElementById('allevents_div');
const buttonSelectAll = document.getElementById('buttonSelectAll');

const FILTER_ALL = "all";
const ENTER = "Enter";
let filterType = FILTER_ALL;

//Создать массив
let arrayTasks = [];

const render = () => {
    let AllTasks = '';
    arrayTasks.forEach((task) => {
        const tag = `<div data-id="${task.id}">
            <input type="checkbox" ${task.isComplited ? 'checked' : ''} name="" id="">
            <input class="redTask" maxlength = "250" autocomplete="off" hidden>
            <span data-id="text-task">${task.text}</span>
            <button class="button_delete_onetask" data-id"button_delete_onetask">X</button>
        </div>`;
        AllTasks += tag;
    })
    allevents_div.innerHTML = AllTasks;
};

const ClickAddTask = () => {
    const allevents_div_add = addtask_input.value;
    addtask_input.value = " ";
    AddTaskObject(allevents_div_add);
}

const resetToDefaultPreferens = () =>{
    filterType = FILTER_ALL;
    buttonSelectAll.checked = false;
    render();
}

const AddTaskObject = (addtask_input) => {
    let idNewTask = arrayTasks.length ? arrayTasks.at(-1).id + 1 : 0;
    arrayTasks.push({
        id: idNewTask,
        text: addtask_input,
        isComplited: false
    });
    resetToDefaultPreferens();
}



document.querySelector('.list-tasks') //Взятие по классу

let task = 0;

const onKeyUpInput = (event)  => {
    const keycode = event.code;
    if(keycode === ENTER){
        const allevents_div_add = addtask_input.value;
        addtask_input.value = " ";
        AddTaskObject(allevents_div_add);
    }
}
addtask_button.addEventListener('click', ClickAddTask);

addtask_input.addEventListener('keyup', onKeyUpInput);