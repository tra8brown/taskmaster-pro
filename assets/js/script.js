var tasks = {}; //hi

var createTask = function(taskText, taskDate, taskList) {
    // create elements that make up a task item
    var taskLi = $("<li>").addClass("list-group-item");
    var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);

    var taskP = $("<p>").addClass("m-1").text(taskText);
    // append span and p element to parent li
    taskLi.append(taskSpan, taskP);

    //check due date
    auditTask(taskLi);

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

//creating and editing task functions for due dates 5.4.6
var auditTask = function(taskEl) {
    //get date from task element
    var date = $(taskEl).find("span").text().trim();

    //convert to moment object at 5:00PM
    var time = moment(date, "L").set("hour", 17);

    //remove an old classes from element
    $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

    // apply new class if task is near/over due date
    if (moment().isAfter(time)) {
        $(taskEl).addClass("list-group-item-danger");
    } else if (Math.abs(moment().diff(time, "days")) <= 2) {
        $(taskEl).addClass("list-group-item-warning");
    }
};

//   sortable ()
$(".card .list-group").sortable({
    connectWith: $(".card .list-group"),
    scroll: false,
    tolerance: "pointer",
    helper: "clone",
    activate: function(event, ui) {
        $(this).addClass("dropover");
        $(".bottom-trash").removeClass("bottom-trash-drag");
        console.log(ui);
    },
    deactivate: function(event, ui) {
        $(this).removeClass("dropover");
        $(".bottom-trash").removeClass("bottom-trash-drag");
        console.log(ui);
    },
    over: function(event) {
        $(event.target).addClass("dropover-active");
        $(".bottom-trash").addClass("bottom-trash-active");
        console.log(event);
    },
    out: function(event) {
        $(event.target).removeClass("dropover-active");
        $("bottom-trash").removeClass("bottom-trash-active");
        console.log(event);
    },
    update: function(event) {
        // array to store the task data in
        var tempArr = [];

        // loop over current set of children in sortable list
        $(this).each(function() {
            tempArr.push({
                text: $(this)
                    .find("p")
                    .text()
                    .trim(),

                date: $(this)
                    .find("span")
                    .text()
                    .trim()
            });
        });

        // trim down list's ID to match object property
        var arrName = $(this)
            .attr("id")
            .replace("list-", "");

        // update array on tasks object and save
        tasks[arrName] = tempArr;
        saveTasks();
    },
    stop: function(event) {
        $(this).removeClass("dropover");
    }
});

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
});

// blur callback () 5.1.6
$("list-group").on("click", "p", function() {
    var text = $(this)
        .text()
        .trim();

    var textInput = $("<textarea>").addClass("form-control").val(text); //
    $(this).replaceWith(textInput);

    textInput.trigger("focus"); //highlights the input box 
});

$(".list-group").on("blur", "textarea", function() { //blur event will trigger 5.1.6

    // get the textarea's current value/text 5.1.6
    var text = $(this).val();


    //get the parent ul's id attribute 5.1.7
    var status = $(this)
        .closest(".list-group")
        .attr("id")
        .replace("list-", "");
    //get the task's positionin the list of other li elements 5.1.7
    var index = $(this)
        .closest(".list-group-item")
        .index();

    //update task in array and re-svae to localstorage 5.1.7
    tasks[status][index].text = text;
    saveTasks();

    //recreate span element with bootstrap classes 5.1.7
    var taskP = $("<p>")
        .addClass("m-1")
        .text(text);

    //replace input with span element 5.1.7
    $(this).replaceWith(taskP);
});


//due date was clicked 5.1.7
$(".list-group").on("click", "span", function() {
    // get current text
    var date = $(this).text().trim();

    // create new input element
    var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

    // swap out elements 
    $(this).replaceWith(dateInput);

    // enable jquery ui datepicker
    dateInput.datepicker({
        minDate: 1,
        onClose: function() {
            // when calendar is closed, force a "change" event on the `dateInput`
            $(this).trigger("change");
        }
    });

    // automatically bring up the calendar
    dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
    var date = $(this).val();

    // get the parent ul's id attribute 5.1.6
    var status = $(this).closest(".list-group").attr("id").replace("list-", "");

    // get the task's position in the list of other li elements 5.1.6
    var index = $(this).closest(".list-group-item").index();

    tasks[status][index].date = date; //5.1.6
    saveTasks();

    //recreate p element 5.1.6
    var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
    $(this).replaceWith(taskSpan);

    // Pass task's <li> element into auditTask() to check new due date
    auditTask($(taskSpan).closest(".list-group-item"));
});

// remove all tasks
$("#remove-tasks").on("click", function() {
    for (var key in tasks) {
        tasks[key].length = 0;
        $("#list-" + key).empty();
    }
    saveTasks();
});

//trash can be dropped onto
$("#trash").droppable({
    accept: ".card .list-group-item",
    tolerance: "touch",
    drop: function(event, ui) {
        ui.draggable.remove();
        console.log("drop");
    },
    over: function(event, ui) {
        console.log(ui);
    },
    out: function(event, ui) {
        console.log(ui);
    }
});
//setInterval ()
setInterval(function() {
    // $(".card .list-group-item").each(function(index, el) {
    //     auditTask(el);
    // });
}, (1000 * 60) * 30);

//.datepicker()
$("#modalDueDate").datepicker({
    minDate: 1
});

// load tasks for the first time
loadTasks();