

function makeRequest(options) {
    return new Promise((resolve, reject)=> {
        let xhr = new XMLHttpRequest();
        xhr.open(options.method, options.url, true);
        xhr.onreadystatechange = ()=> {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                var status = xhr.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                  // The request has been completed successfully
                  resolve({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        response: JSON.parse(xhr.responseText)
                      });
                } else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        response: JSON.parse(xhr.responseText)
                    });
                }
            }
        };
        xhr.onerror=()=>{
            reject({
                status: xhr.status,
                statusText: xhr.statusText,
                response: JSON.parse(xhr.responseText)
            });
        };
        //setting header...
        let headers = options.headers, params = options.params, data;
        if (headers && typeof headers == 'object') {
            for (const [key, value] of Object.entries(headers)) {
                xhr.setRequestHeader(key, value);
            }
        }
        //setting params...
        if (params && typeof params == 'object') {
            params = Object.keys(params).map(function (key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            }).join('&');
        }

        // setting data in JSON form
        data = JSON.stringify(options.data);
        xhr.send(data);
    }); 
}


async function addTask(t) {
  var input = document.getElementById("taskInput");
  var taskList = document.getElementById("taskList");
  var username = document.getElementById("username").innerText;

  if(t != undefined){
    input.value = t
  }

  if (input.value.trim() !== "") {
    var task = document.createElement("li");
    var taskText = document.createElement("span");
    taskText.textContent = input.value;
    var deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function () {
      var username = document.getElementById("username").innerText;  
      makeRequest({method: "GET", url: `/deltask`+'?name='+username + '&task='+task.removeChild(taskText).innerHTML})

      task.remove();
    };

    makeRequest({method: "GET", url: `/addtask`+'?task='+input.value + '&name='+username});

    task.appendChild(taskText);
    task.appendChild(deleteButton);
    taskList.appendChild(task);
    input.value = "";
  }
}


async function getAllTask(t) {
  var input = document.getElementById("taskInput");
  var taskList = document.getElementById("taskList");

    var task = document.createElement("li");
    var taskText = document.createElement("span");
    taskText.textContent = t;
    var deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function () {
      var username = document.getElementById("username").innerText;  
      makeRequest({method: "GET", url: `/deltask`+'?name='+username + '&task='+task.removeChild(taskText).innerHTML})

      task.remove();
    };

    task.appendChild(taskText);
    task.appendChild(deleteButton);
    taskList.appendChild(task);
}

async function listTask(){
    var username = document.getElementById("username").innerText;
    let task = (await makeRequest({method: "GET", url: `/gettask`+'?name='+username})).response


    for(let i = 0; i < task.length; i++){

        getAllTask(task[i].task)
    }

}

//calling directly

listTask()