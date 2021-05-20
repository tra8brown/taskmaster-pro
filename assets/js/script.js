var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
    // create elements that make up a task item
    var taskLi = $("<li>").addClass("list-group-item");
    var taskSpan = $("<span>")
        .addClass("badge badge-primary badge-pill")
        .text(taskDate);
    var taskP = $("<p>")
        .addClass("m-1")
        .text(taskText);

    // append span and p element to parent li
    taskLi.append(taskSpan, taskP);


    // append to ul list on the page
    $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
    tasks = JSON.parse(localStorage.getItem("tasks"));

    // if nothing in localStorage, create a new object to track all task status arrays
    if (!tasks) {
        tasks = {
            toDo: [],
            inProgress: [],
            inReview: [],
            done: []
        };
    }

    // loop over object properties
    $.each(tasks, function(list, arr) {

        // then loop over sub-array
        arr.forEach(function(task) {
            createTask(task.text, task.date, list);
        });
    });
};

var saveTasks = function() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};




// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
    // clear values
    $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
    // highlight textarea
    $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
    // get form values
    var taskText = $("#modalTaskDescription").val();
    var taskDate = $("#modalDueDate").val();

    if (taskText && taskDate) {
        createTask(taskText, taskDate, "toDo");

        // close modal
        $("#task-form-modal").modal("hide");


        // save in tasks array
        tasks.toDo.push({
            text: taskText,
            date: taskDate

        });
        saveTasks();
    }

    // blur callback () 5.1.6
    $("list-group").on("click", "p", function() {
        var text = $(this)
            .text()
            .trim();
        console.log(this);
    });

    $(".list-group").on("blur", "textarea", function() { //blur event will trigger 5.1.6

        // get the textarea's current value/text 5.1.6
        var text = $(this)
            .val()
            .trim();

        // get the parent ul's id attribute 5.1.6
        var status = $(this)
            .closest(".list-group")
            .attr("id")
            .replace("list-", "");

        // get the task's position in the list of other li elements 5.1.6
        var index = $(this)
            .closest(".list-group-item")
            .index();

        tasks[status][index].text = text; //5.1.6
        saveTasks();

        //recreate p element 5.1.6
        var taskP = $("<p>")
            .addClass("m-1")
            .text(text);

        //replace textarea with p element
        $(this).replaceWith(taskP);

        textInput.trigger("focus"); //highlights the input box 
    });

    //due date was clicked 5.1.7
    $(".list-group").on("click", "span", function() {
        // get current text
        var date = $(this)
            .text()
            .trim();

        // create new input element
        var dateInput = $("<input>")
            .attr("type", "text")
            .addClass("form-control")
            .val(date);

        // swap out elements
        $(this).replaceWith(dateInput);

        // automatically focus on new element
        dateInput.trigger("focus");
    });
    //value of due date was cahnged 5.1.7
    $(".list-group").on("blur", "input[type='text']", function() {
        //get current text 5.1.7
        var date = $(this)
            .val()
            .trim();

        //get the parent ul's id attribute 5.1.7
        var status = $(this)
            .closest(".list-group")
        attr("id")
            .replace("list-", "");
        //get the task's positionin the list of other li elements 5.1.7
        var index = $(this)
            .closest(".list-group-item")
            .index();

        //update task in array and re-svae to localstorage 5.1.7
        tasks[status][index].date = date;
        saveTasks();

        //recreate span element with bootstrap classes 5.1.7
        var taskSpan = $("<span>")
            .addClass("badge badge-primary badge-pill")
            .text(date);

        //replace input with span element 5.1.7
        $(this).replaceWith(taskSpan);
        //});
        var textInput = $("<textarea>") //5.1.6
            .addClass("form-control")
            .val(text);
        $(this).replaceWith(textInput);
    });

    // remove all tasks
    $("#remove-tasks").on("click", function() {
        for (var key in tasks) {
            tasks[key].length = 0;
            $("#list-" + key).empty();
        }
        saveTasks();
    });

    // load tasks for the first time
    loadTasks();
});