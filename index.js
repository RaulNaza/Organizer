// const { event } = require("jquery");

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
function editTask (btn,id,div,submitBtn,title){
    btn.on('click', (event)=>{
        event.preventDefault();
        console.log(`You are trying to edit task with id ${id}`);
        
        div.attr('contenteditable','true');
        submitBtn.removeClass("d-none");
        
        submitBtn.on('click', ()=>{
            let titleText = title.text().toUpperCase();

            console.log(`Changes submited!`);
            //Need to run a function that will use send a PUT ajax request editing the taskName using its id
            editTaskInServer(id,titleText);

            editInstFromServer(id,titleText);

            div.attr('contenteditable','false');
            submitBtn.addClass('d-none');
            refresh();
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
function refresh () {

    ////this will refresh the app-body element showing all tasks.
    p.empty();
    $.get(organizer, function (data) {
        
        if (data.length !== 0){
            for(let task of data){
                p.prepend(`
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
                        </div>
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
                                counter = 0;
                                for (let key of data){
                                    // console.log(`This is the data for task name ${key.taskName} and its ID: ${key.newInstruction}, ${key.id} this is iteration ${counter}`);
                                    // console.log(`This is the value of key ${key.id} on is iteration ${counter}`);
                                    todoTable.append(`
                                        <tr class="row">
                                            <td class="col">${key.taskName}</td>
                                            <td class="col">${key.newInstruction}</td>
                                            <td class="col"><button type="button" class="btn btn-outline-dark" id="edit-btn-${key.id}">Edit</button> <button type="button" class="btn btn-outline-danger" id="delete-btn-${key.id}">Delete Inst.</button></td>
                                        </tr>
                                    `);
                                    counter +=1;
    
                                    //declaring Jquery variable for the delete button
                                    let deleteBtn = $(`#delete-btn-${key.id}`);
                                        //no need to pass in key.newInstruction or key.taskName**********
                                        deleteInstruction(deleteBtn,key.id,key.newInstruction,key.taskName);

                                }
                            }
                        });

            }

            
        }
        
    });

};



//new task should be posted to API JSON Server file
function postTask (taskName){
    $.post(organizer, {
        taskName: taskName,
    })
};

//new Todo will post to todoList with its respective organizer ID
function postToDo (taskId,taskName,instruction){
    $.post(`${organizer}/${taskId}/todolist`, {
        taskName: taskName,
        newInstruction: instruction,
    });
};

//THIS FUNCTION IS NOT WORKING PROPERLY******************************************************
function editTaskInServer (id,newTaskName){
    console.log(`This is the Task ID: ${id}. With taskName: ${newTaskName}`);

    $.ajax({
        url: `${organizer}/${id}`,
        type: 'PUT',
        data: {
            "taskName": newTaskName
        },
        success: () =>{
            console.log(`You changed the name for task with ID: ${id}`)
        }
    });
};

function editInstFromServer(id,newTaskName){
    
    let arr = [];
    let newInstruction = [];
    let organizerId = [];

    //will also need to edit taskName in the todolist resource
    $.get(`${todoList}?OrganizerId=${id}`).then(function (data){

        if (data.length !== 0){
            for(let key of data){
                newInstruction.push(key.newInstruction);
                organizerId.push(key.OrganizerId);
                arr.push(key.id);
                // console.log(`This is the todoList Instructions ID: ${organizerId}`)
            }
            
        };
        
        //If I ran the below AJAX method within the data loop it caused a server error "EADDRINUSE"
        //I believe the method was running either infenitely or trying to edit("PUT") the changes simultaneously causing server to crash
        //I pushed each property of key(above) to empty arrays as a way to avoid this issue.Then, looped the new arrays to update the server data
        if(arr.length !== 0){
            for (let i = 0; i < arr.length; i++){

                console.log('this is arr: ' + arr[i]);
                console.log('this is newInstruction: ' + newInstruction[i]);
                console.log('this is organizerId: ' + organizerId[i])

                $.ajax({
                    url: `${todoList}/${arr[i]}`,
                    type: 'PUT',
                    data: {
                        "taskName":newTaskName,
                        "newInstruction": newInstruction[i],
                        "OrganizerId": organizerId[i],
                    }
                });

            };
        };
        
    });

};


function deleteTaskFromServer(id){
    
    $.ajax({
        url: `${organizer}/${id}`,
        type: 'DELETE',
        success: () => {
            // console.log(`The task with id ${id} should now have been deleted from server`)
        }
    });

    //deleting a task should also delete its corresponding todo instructions
        $.get(`${todoList}?OrganizerId=${id}`).then(function (data) {
            //loop through all the occurences and delete from server
            for(let key of data){
                
                deleteInstFromServer(key.id);
            };
        });

};


//Deleting instruction from server
function deleteInstFromServer (id){
    $.ajax({
        url: `${todoList}/${id}`,
        type: 'DELETE',
        success: ()=>{
            console.log(`The instruction with id ${id} should now be deleted from the server`)
        }
    });
};



//*******************************************************************************************//
//manipulating nested objects in JSON FILE
// $.get(organizer, function (data){

//     let keys = Array.from(data);
//     let todoListOfKey1 = keys[0].todoList

//     console.log(todoListOfKey1)
//     if(Object.hasOwn(todoListOfKey1, "todo1")){
//         console.log("success")
//     }

// })


// $.ajax(`${organizer}/3/todoList`, {
//     type: "put",
//     data: {
//         "todo1": "blah"
//         },

//     }
// );



//Used to append a new instruction to the todo list
// function addNewInstruction(div,instruction,id){
//     div.append(`
//     <table>
//         <tr class="row">
//             <td class="col">1.</td>
//             <td class="col">${instruction}</td>
//         </tr>
//     </table>
//     `);

// };




// //new instruction should be posted to API JSON Server file
function findTaskId (taskname){
    $.get(`${organizer}?taskName=TASK3`).then(function (data) {
            let keys = (data[0]);
            let id = keys.id;
            console.log(id)
    
        getListOfTodos(id)
    }); 
};

function getListOfTodos (id){
    $.get(`${todoList}?OrganizerId=${id}`).then(function (data) {
        let arr = [];
        for(let key of data){
            arr.push(key.id)
            deleteInstFromServer(key.id);
        };
        
        console.log(`should return data of any todos with the assigned id: ${arr}`)
    });
};


function assignToTask(){
    $.post(`${organizer}/3/todolist`, {
        "todo2" : "Success2"
    });
};

// assignToTask();

///////////////////////////Idea from before/////////////////////////////////////////////

// //Todo Button/List

// //// Within this function we can acces the instructions div element
// let todoBtn = $('#btn-add-todo')
    
// todoBtn.on('click', (event) =>{
//     event.preventDefault();
//     console.log(event);

//     let instructions = $('#todo');
//     let newInstruction = $('#input-instructions').val();
//     addNewInstruction(instructions,newInstruction,id);

//     $('#input-instructions').val('');
// });


//Working todo button list usign counter

// function addToDo (todoBtn,todoTable,taskName,newInstructionInput,emptyInput,tableHeading){
//     let counter = 1;
    
//     todoBtn.on('click', (event) =>{
//         event.preventDefault();
        
//         let newInst = newInstructionInput.val()
//         let taskId = todoTable[0].id;
//         console.log(taskId)

//         if(newInst !== ""){
//             emptyInput.addClass("d-none");
//             //show table heading once a todo is added. *** Will need to be changed to if a todo already exists
//             tableHeading.removeClass("d-none");

//             todoTable.append(`
//                     <tr class="row">
//                         <td class="col">${counter}.</td>
//                         <td class="col">${newInst}</td>
//                     </tr>
//             `);
//             postToDo(taskId,taskName,newInst);
//             counter += 1;
//             //should be changed to newInstructionInput.val();********
//             newInstructionInput.val();
//         }else{

//             emptyInput.removeClass("d-none");
//         }

//     });
// };
