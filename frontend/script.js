//Переменные
const addtask_button = document.getElementById('addtask_button');

const addtask_input = document.getElementById('addtask_input');

const allevents_div = document.getElementById('allevents_div')

let task = 0;

addtask_button.addEventListener('click', function() {
    const allevents_div_add = addtask_input.value;
    task++;
    allevents_div.innerHTML += `<div><input type="checkbox" name="alltask${task}" id="alltask${task}">${allevents_div_add}</div>`;
});