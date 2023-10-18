
//Server
const organizer = "http://localhost:3000/Organizer";
const todoList = "http://localhost:3000/todolist";

//Query
let p = $('#app-body')
let submitBtn = $('#submitBtn')
let input = $('.form-control')

let emptyStr = new RegExp("^\\s*$")

////TASK////
//Button to Add New Task
submitBtn.on('click', (event) =>{
    event.preventDefault();

    //Need to test if input is black. Should return error
    let taskName = input.val().toUpperCase();
    
    //Test for empty space **if 2 spaces are use it will not work
    if(emptyStr.test(taskName) === false){
        
        //Creating the Body of the app
        ////This will add a new task object to the server
        postTask(taskName); 
        input.val('');
        ////Will run refresh() to update our app body
        refresh();
    }

});

//Button to Edit Existing Task
function editTask (btn,id,div,submitBtnEdit,title,emptyInput){
    btn.on('click', (event)=>{
        event.preventDefault();
        
        div.attr('contenteditable','true');
        submitBtnEdit.removeClass("d-none");
        
        submitBtnEdit.on('click', ()=>{
           if(emptyStr.test(title.text()) === false){

                    emptyInput.addClass('d-none');

                    let titleText = title.text().toUpperCase();

                    editTaskInServer(id,titleText);

                    div.attr('contenteditable','false');
                    submitBtnEdit.addClass('d-none');

                    return refresh();
               
            }
            if(emptyStr.test(title.text()) === true){
                emptyInput.removeClass('d-none');
                emptyInput.text("Please change task name and try again.")
                

            }


        });
    });
};


//Button to Delete Existing Task

function deleteTask(deleteBtnForTask,id){
    deleteBtnForTask.on('click', (event) =>{
        event.preventDefault();

        deleteTaskFromServer(id);

        
        refresh();

    });
};

////TODO INSTRUCTIONS////

//Button to add new instructions to To Do List
//// Within this function we can access the button itself, todoDiv, newInstructionsInput (this is the input element),
//// and emptyInput (used to add an alert if the input being trying to add is empty).

function addToDo (todoBtn,todoTable,taskName,newInstructionInput,emptyInput){
    
    todoBtn.on('click', (event) =>{
        event.preventDefault();

        let str = newInstructionInput.val()
    
        
        if(emptyStr.test(str) === false){
            
            let firstCharUpper = `${str[0].toUpperCase()}${str.slice(1)}`;
            let newInst = firstCharUpper.slice(0,115);
            let taskId = todoTable[0].id;

            //do not display emptyInput alert label if newInst does not return an empty string
            emptyInput.addClass("d-none");

            //post data to server
            postToDo(taskId,taskName,newInst);

            //after posting to server we need to run our refresh function to update out tables
            refresh();

            //clears out the input for better user experience
            newInstructionInput.val("");
        }else{
            //if the newInstruction input is empty then the emptyInput alert label will be displayed in red
            emptyInput.removeClass("d-none");
            emptyInput.text("You cannot add an empty To Do. Please try again. :)");
        }

    });
};

//Button to Edit a current ToDo Inst
function editTodo(btn, submitBtn, todoId, nameField,emptyInput) {
    btn.on("click", function () {
        nameField.attr('contenteditable', 'true');

        submitBtn.removeClass('d-none');

        submitBtn.on('click', () => {
            if (emptyStr.test(nameField.text()) === false) {

                let str = nameField.text();
                let firstCharUpper = str[0].toUpperCase() + str.slice(1);
                let newName = firstCharUpper.slice(0, 115);

                editTodoInst(todoId, newName);

                nameField.attr('contenteditable', 'false')
                submitBtn.addClass('d-none');

                refresh();
            }else{
                emptyInput.removeClass("d-none");
                emptyInput.text("The new name for the To Do being edited cannot be blank. Please try again! :)")
            }

        });
    });
};



//Delete Instruction button
function deleteInstruction(btn,id,instName,instTaskName){
    btn.on('click', (event)=>{
        event.preventDefault();

        deleteInstFromServer(id);
        refresh();
    });
};

//Formating functions: This will check to see if the checkbox input has been checked
////If it has been checked then we move forward to strikethrough its corresponding ToDo Instruction
function strikeTodo(checkbox,todoName) {

    checkbox.on('change', function(){
            if(checkbox.is(':checked')){
                todoName.addClass('text-decoration-line-through')
                
            }else{
                todoName.removeClass('text-decoration-line-through')
            }
        
    })
}




//This function will be used to refresh the app body in order to show all tasks and their todos
function refresh (event) {

    ////this will refresh the app-body element showing all tasks.
    p.empty();
    $.get(organizer, function (data) {
        
        if (data.length !== 0){
            for(let task of data){
                p.prepend(`
                <div class="container-fluid border border-secondary border-2 rounded shadow-lg p-3 mb-5 bg-body-tertiary" style="width: 70%;">
                    <div class="container">
                        <div class="container fs-4 fw-bold text-center" id="${task.taskName}">
                            <p class="text-decoration-underline" id="task-title-${task.id}">${task.taskName.toUpperCase()}</p>
                        </div>
                        <button class="btn btn-secondary d-none mb-2" id="submit-task-edit">Done Edit</button>
                    </div>        
                    <div>
                        <div>
                            <form class="row">
                                <div class="col-6">
                                    <input class="form-control mb-1" id="input-instructions" style="width: 60%;" placeholder="New Instruction"></input>
                                    <button class="btn btn-primary" type="butto n" id="add-todo-${task.taskName}">Add To-Do</button>
                                    <button class="btn btn-outline-dark" type="button" id="edit-delete-${task.id}">Edit Task</button>
                                    <button class="btn btn-outline-danger" type="button" id="task-delete-${task.id}">Delete Task</button><br>
                                </div>
                                <div class="col-6">
                                    <label class="alert alert-danger mt-4 d-none" role="alert" id="empty-input"></label><br>
                                </div>
                            </form>
                        </div>
                        <div class="container">
                            <div class="fs-3 fst-italic">To Do:</div>
                        <div>
                            <table class="table table-striped table-hover" >
                                <thead class="d-none" id="table-heading">
                                    <tr class="row">
                                        <th class="col-1"></th>
                                        <th class="col-5"></th>
                                        <th class="col-2">Done?</th>
                                        <th class="col-4"></th>
                                    </tr>
                                </thead>
                                <tbody id="${task.id}">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                `);
                //declaring JQueries
                let todoTable = $(`#${task.id}`);
                let newInstructionInput = $('#input-instructions');
                let emptyInput = $('#empty-input');
                let tableHeading = $('#table-heading');
                let taskNameDiv = $(`#${task.taskName}`)
                let todoBtn = $(`#add-todo-${task.taskName}`);
                let editBtnForTask = $(`#edit-delete-${task.id}`);
                let taskTitle = $(`#task-title-${task.id}`);
                let submitTaskEdit = $("#submit-task-edit");
                let deleteBtnForTask = $(`#task-delete-${task.id}`);

                //pass the above variables as arguments to the addToDo functions
                addToDo(todoBtn, todoTable, task.taskName, newInstructionInput, emptyInput);

                //task edit button function
                editTask(editBtnForTask, task.id, taskNameDiv, submitTaskEdit, taskTitle, emptyInput);
                //task delete button function
                deleteTask(deleteBtnForTask, task.id);

                    ///This will refresh the table within each task
                    $.get(`${todoList}?OrganizerId=${task.id}`, function(data){
                        
                        if(data.length !== 0){
                            //shows the table heading if the task has any todo instructions
                            tableHeading.removeClass("d-none");
                            
                            let counter = 1;
                            for (let key of data){

                                todoTable.append(`
                                    <tr class="row">
                                        <td class="col-1">${counter}.</td>
                                        <td class="col-5 overflow-auto" id="todo-name-${key.id}" for="${key.id}">${key.newInstruction}</td>
                                        <td class="col-2"><input class="form-check-input" id="check-${key.id}" type="checkbox"></input></td>
                                        <td class="col-4"><button class="col btn btn-outline-dark d-none" id="edit-submit-${key.id}">Submit</button> <button type="button" class="col btn btn-outline-dark" id="edit-btn-${key.id}">Edit</button> <button type="button" class="col btn btn-outline-danger" id="delete-btn-${key.id}">Delete Inst.</button></td>
                                    </tr>
                                `);
                                counter +=1;

                                //declaring Jquery variable for the delete button
                                let deleteBtn = $(`#delete-btn-${key.id}`);
                                //edit button
                                let editTodoBtn = $(`#edit-btn-${key.id}`);
                                let todoName = $(`#todo-name-${key.id}`);
                                let editSub = $(`#edit-submit-${key.id}`);
                                    
                                    editTodo(editTodoBtn,editSub,key.id,todoName,emptyInput);
                                    deleteInstruction(deleteBtn,key.id,key.newInstruction,key.taskName);
                                    //runs the StrikeTodo functions checking the status of the checkbox
                                    let checkBox = $(`#check-${key.id}`);
                                    strikeTodo(checkBox,todoName)
                            };
                        };
                    });

            }

            
        }
        
    });

};


//Functions to add server data using AJAX methods

//new task should be posted to API JSON Server file
function postTask (taskName){
    $.post(organizer, {
        taskName: taskName,
    });
};

//new Todo will post to todoList with its respective organizer ID
function postToDo (taskId,taskName,instruction){
    $.post(`${organizer}/${taskId}/todolist`, {
        taskName: taskName,
        newInstruction: instruction,
    });
};

//Functions to delete server data usign AJAX methods
function deleteTaskFromServer(id){
    
    $.ajax({
        url: `${organizer}/${id}`,
        type: 'DELETE',
        success: () => {
            getTodoId(id,'delete');
        }
    });
};

//find the id of each todo with an OrganizerId that matches the task id
function getTodoId (id,requestType,newTaskName){

    $.ajax({
        url: `${todoList}?OrganizerId=${id}`,
        type:'GET',
        async: false,
        success: function (data) {
            if(requestType === 'edit'){
                for(let key of data){
                 editTodoTaskName(key.id,newTaskName)
                }
            }else if(requestType === 'delete'){
                for(let key of data){
                    deleteInstFromServer(key.id)
                }

            }
        }
    });
};

//Deleting instruction from server
function deleteInstFromServer (id){
    $.ajax({
        url: `${todoList}/${id}`,
        type: 'DELETE',
        async: true,
        success: ()=>{
        }
    });
};


//Functions to edit server data using AJAX methods

function editTaskInServer(id, titleText) {
    $.ajax({
        url: `${organizer}/${id}`,
        type: 'PATCH',
        async: false,
        data: {
            taskName: `${titleText}`
        },
        success: () => {
            getTodoId(id, "edit", titleText)
        }
    });

};

function editTodoTaskName(id,newTaskName){
    $.ajax({
        url: `${todoList}/${id}`,
        type: 'PATCH',
        async:false,
        data: {
            taskName: `${newTaskName}`
        }
    });
};

function editTodoInst(id,newInstName){
    $.ajax({
        url: `${todoList}/${id}`,
        type: 'PATCH',
        async:false,
        data: {
            newInstruction: `${newInstName}`
        }
    });
};