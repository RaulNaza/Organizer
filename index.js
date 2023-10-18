
//Server
const organizer = "http://localhost:3000/Organizer";
const todoList = "http://localhost:3000/todolist";

//Query
let p = $('#app-body')
let submitBtn = $('#submitBtn')
let input = $('.form-control')


////TASK////
//Button for New Task
submitBtn.on('click', (event) =>{
    event.preventDefault();

    //Need to test if input is black. Should return error
    let taskName = input.val().toUpperCase();
    
    //Test for empty space **if 2 spaces are use it will not work
    if(taskName !== ""){
        
        //Creating the Body of the app
        ////This will add a new task object to the server
        postTask(taskName); 
        input.val('');
        ////Will run refresh() to update our app body
        refresh();
    }

});

//Edit task
function editTask (btn,id,div,submitBtnEdit,title){
    btn.on('click', (event)=>{
        event.preventDefault();
        console.log(`You are trying to edit task with id ${id}`);
        
        div.attr('contenteditable','true');
        submitBtnEdit.removeClass("d-none");
        
        submitBtnEdit.on('click', ()=>{
            let titleText = title.text().toUpperCase();

            console.log(`Changes submited!`);
            //Need to run a function that will use send a PUT ajax request editing the taskName using its id
            editTaskInServer(id,titleText);

            // editInstFromServer(id,titleText);

            div.attr('contenteditable','false');
            submitBtnEdit.addClass('d-none');

            return refresh();
        })
        
        
    });
};


//delete task

function deleteTask(deleteBtnForTask,id){
    deleteBtnForTask.on('click', (event) =>{
        event.preventDefault();

        // console.log(`This is the buttons ID ${id}`)
        deleteTaskFromServer(id);

        
        refresh();

    });
};


//Button to add new instructions to To Do List

//// Within this function we can access the button itself, todoDiv, newInstructionsInput (this is the input element),
//// and emptyInput (used to add an alert if the input being trying to add is empty).

function addToDo (todoBtn,todoTable,taskName,newInstructionInput,emptyInput){
    
    todoBtn.on('click', (event) =>{
        event.preventDefault();

        let newInst = newInstructionInput.val()
        let taskId = todoTable[0].id;
        // console.log(taskId)

        if(newInst !== ""){
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
        }

    });
};

//Edit todo
function editTodo(btn,submitBtn,todoId,nameField){
    btn.on("click", function (){
        nameField.attr('contenteditable','true');

        submitBtn.removeClass('d-none');

        submitBtn.on('click', ()=>{
            console.log(`Success todo should be edited now! This is the value of text: ${nameField.text()}`)

            editTodoInst(todoId,nameField.text());

            nameField.attr('contenteditable', 'false')
            submitBtn.addClass('d-none');
            
            refresh();
        })
    })
};



//Delete Instruction button
function deleteInstruction(btn,id,instName,instTaskName){
    btn.on('click', (event)=>{
        event.preventDefault();

        // console.log(`This would delete the ${instName} assisgned to task name ${instTaskName} with ID: ${id}`);
        deleteInstFromServer(id);
        refresh();
    });
};




//This function will be used to refresh the app body in order to show all tasksand their todos
function refresh (event) {


    ////this will refresh the app-body element showing all tasks.
    p.empty();
    $.get(organizer, function (data) {
        
        if (data.length !== 0){
            for(let task of data){
                p.prepend(`
                <div class="container-fluid border border-secondary mb-3" style="width: 70%;">
                    <div class="container" id="${task.taskName}">
                        <p id="task-title">${task.taskName.toUpperCase()}</p>
                    </div>
                        <button class="btn btn-secondary d-none mb-2" id="submit-task-edit">Done Edit</button>
                    <div>
                            <div>
                                <form>
                                    <input class="form-control mb-1" id="input-instructions" style="width: 30%;" placeholder="New Instruction"></input>
                                    <button class="btn btn-primary" type="button" id="add-todo-${task.taskName}">Add To-Do</button>
                                    <button class="btn btn-outline-dark" type="button" id="edit-delete-${task.id}">Edit Task</button>
                                    <button class="btn btn-outline-danger" type="button" id="task-delete-${task.id}">Delete Task</button><br>
                                    <label class="text-danger d-none" role="alert" id="empty-input">Please input a To Do.</label><br>
                                </form>
                            </div>
                            <div class="mt-1">
                                To Do:
                            <div>
                                <table class="table table-striped table-hover" >
                                    <thead class="d-none" id="table-heading">
                                        <tr class="row">
                                            <th class="col"></th>
                                            <th class="col">ToDO Inst.</th>
                                            <th class="col"></th>
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

                    //declaring buttons
                    let todoBtn = $(`#add-todo-${task.taskName}`);
                    let editBtnForTask = $(`#edit-delete-${task.id}`);
                    let taskTitle = $('#task-title');
                    let submitTaskEdit = $("#submit-task-edit");
                    let deleteBtnForTask = $(`#task-delete-${task.id}`);

                    //pass the above variables as arguments to the addToDo functions
                    addToDo(todoBtn,todoTable,task.taskName,newInstructionInput,emptyInput);
                    // console.log(task.id)

                    //task edit button function
                    editTask(editBtnForTask,task.id,taskNameDiv,submitTaskEdit,taskTitle);
                    //task delete button function
                    deleteTask(deleteBtnForTask,task.id);

                        ///This will refresh the table within each task
                        $.get(`${todoList}?OrganizerId=${task.id}`, function(data){
                            
                            if(data.length !== 0){
                                //shows the table heading if the task has any todo instructions
                                tableHeading.removeClass("d-none");
                                
                                for (let key of data){
                                    // console.log(`This is the data for task name ${key.taskName} and its ID: ${key.newInstruction}, ${key.id} this is iteration ${counter}`);
                                    // console.log(`This is the value of key ${key.id} on is iteration ${counter}`);
                                    todoTable.append(`
                                        <tr class="row">
                                            <td class="col">${key.taskName}</td>
                                            <td class="col" id="todo-name-${key.id}">${key.newInstruction}</td>
                                            <td class="col"><button class="col btn btn-outline-dark d-none" id="edit-submit-${key.id}">Submit</button> <button type="button" class="col btn btn-outline-dark" id="edit-btn-${key.id}">Edit</button> <button type="button" class="col btn btn-outline-danger" id="delete-btn-${key.id}">Delete Inst.</button></td>
                                        </tr>
                                    `);
    
                                    //declaring Jquery variable for the delete button
                                    let deleteBtn = $(`#delete-btn-${key.id}`);
                                    //edit button
                                    let editTodoBtn = $(`#edit-btn-${key.id}`);
                                    let todoName = $(`#todo-name-${key.id}`);
                                    let editSub = $(`#edit-submit-${key.id}`);
                                        //no need to pass in key.newInstruction or key.taskName**********
                                        editTodo(editTodoBtn,editSub,key.id,todoName);
                                        deleteInstruction(deleteBtn,key.id,key.newInstruction,key.taskName);
                                };
                            };
                        });

            }

            
        }
        
    });

};



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


function deleteTaskFromServer(id){
    
    $.ajax({
        url: `${organizer}/${id}`,
        type: 'DELETE',
        success: () => {
            // console.log(`The task with id ${id} should now have been deleted from server`)
            console.log(`Task Deleted from server and returning this id ${id}`)
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
                    console.log('This key: ' + key.id)
                 editTodoTaskName(key.id,newTaskName)
                }
            }else if(requestType === 'delete'){
                for(let key of data){
                    console.log('This key: ' + key.id)
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
            console.log(`The instruction with id ${id} should now be deleted from the server`)
        }
    });
};


//Editing

function editTaskInServer (id,titleText){
    $.ajax({
        url: `${organizer}/${id}`,
        type: 'PATCH',
        async: false,
        data: {
            taskName: `${titleText}`
        },
        success: () =>{
            console.log(`Data should now be edited for task with id: ${id}`)
            getTodoId(id,"edit",titleText)
        }
    })

};

function editTodoTaskName(id,newTaskName){
    $.ajax({
        url: `${todoList}/${id}`,
        type: 'PATCH',
        async:false,
        data: {
            taskName: `${newTaskName}`
        },
        success: () => {
            console.log('The instruction should now be edited as well')
        }
    })
}

function editTodoInst(id,newInstName){
    $.ajax({
        url: `${todoList}/${id}`,
        type: 'PATCH',
        async:false,
        data: {
            newInstruction: `${newInstName}`
        },
        success: () => {
            console.log('The instruction should now be edited as well')
        }
    })
}