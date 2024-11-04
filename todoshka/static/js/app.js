new Vue({
    el: '#app',
    data() {
        return {
            tasks: [],
            isLoading: true,
            isModalOpen: false,
            editingTask: false,

            parentTaskId: null,
            taskType: '',

            newTask: {
                name: '',
                description: ''
            },


            timeZone: '',
            offsetInHours: 0,
        };
    },
    methods: {
        handleSubmit() {
            if (this.editingTask) {
                this.saveEditedTask();
            } else {
                this.saveTask();
            }
        },
        async fetchTasks() {
            this.isLoading = true;
            try {
                const response = await fetch('/api/tasks/');
                if (!response.ok) throw new Error('Network response was not ok');
                this.tasks = await response.json();
            } catch (error) {
                console.error('Ошибка при получении задач:', error);
            } finally {
                this.isLoading = false;
            }
        },
        openModal(taskType,parentTaskId=null) {
            this.isModalOpen = true;
            this.taskType = taskType;
            this.parentTaskId = parentTaskId;


        },
        openEditModal(task) {
            this.newTask = {
                ...task,
            };
            const dueDateTime = task.due_date ? new Date(task.due_date) : null;

            if (dueDateTime) {
                this.newTask.date = dueDateTime.toLocaleDateString('en-CA');
                if (this.newTask.has_time) {
                    this.newTask.time = `${dueDateTime.getHours().toString().padStart(2, '0')}:${dueDateTime.getMinutes().toString().padStart(2, '0')}`;
                }
            }

            this.editedTaskId = task.id;
            this.editingTask = true;
            this.isModalOpen = true;
        },
        closeModal() {
            this.isModalOpen = false;
            this.editingTask = false;
            this.newTask = {name: '', description: ''};
            this.editedTaskId = null;
            this.parentTaskId = null;

        },
        prepareTaskData(task) {
            const csrftoken = this.getCookie('csrftoken');
            let dateTimeString;
            if (task.date && task.time) {
                dateTimeString = new Date((task.date) + 'T' + (task.time)).toISOString();

            } else if (task.date || task.time) {
                dateTimeString = (task.date || new Date().toLocaleDateString('en-CA')) + 'T' + (task.time || '00:00:00');
            } else {
                dateTimeString = null
            }
            task.has_time = !!task.time;
            console.log("dateTimeString" + dateTimeString)
            return {
                csrftoken: csrftoken,
                dateTimeString: dateTimeString,
                has_time: task.has_time
            };
        },
        async saveTask() {
            const taskData = this.prepareTaskData(this.newTask);

            this.newTask.due_date = taskData.dateTimeString;
            if (this.parentTaskId) this.newTask.parent_task = this.parentTaskId;



            console.log("taskdata" + taskData)
            try {
                const response = await fetch('/api/tasks/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': taskData.csrftoken
                    },
                    body: JSON.stringify({
                        ...this.newTask,
                        task_type: this.taskType,
                    }),
                });
                if (!response.ok) throw new Error('Ошибка при создании задачи');
                this.tasks.push(await response.json());
                this.closeModal();

            } catch (error) {
                console.error('Ошибка при создании задачи:', error);
            }

        },

        async saveEditedTask() {
            const taskData = this.prepareTaskData(this.newTask);


            this.newTask.due_date = taskData.dateTimeString;
            try {
                const response = await fetch(`/api/tasks/${this.editedTaskId}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': taskData.csrftoken
                    },
                    body: JSON.stringify(this.newTask)
                });
                if (!response.ok) throw new Error('Ошибка при обновлении задачи');
                this.fetchTasks();
                this.closeModal();
            } catch (error) {
                console.error('Ошибка при обновлении задачи:', error);
            }
        },

        async deleteTask() {
            const csrftoken = this.getCookie('csrftoken');
            try {
                const response = await fetch(`/api/tasks/${this.editedTaskId}/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken
                    },
                    body: JSON.stringify(this.newTask)
                });
                if (!response.ok) throw new Error('Ошибка при обновлении задачи');
                this.fetchTasks();
                this.closeModal();
            } catch (error) {
                console.error('Ошибка при обновлении задачи:', error);
            }
        },


        async updateTaskStatus(taskId, completed) {
            const csrftoken = this.getCookie('csrftoken');
            try {
                const response = await fetch(`/api/tasks/${taskId}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken
                    },
                    body: JSON.stringify({completed})
                });
                if (!response.ok) throw new Error('Ошибка при обновлении задачи');
                console.log('Задача обновлена успешно');
            } catch (error) {
                console.error('Ошибка при обновлении задачи:', error);
            }
        },


        getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    cookie = cookie.trim();
                    if (cookie.startsWith(name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        },
        test() {
            // const now = new Date();
            // console.log(now);
            // console.log(now.toISOString());
            //
            // console.log(now.toLocaleString().split(",")[0]);
            // console.log(now.toLocaleDateString('en-CA'));


        },
        formatDueDate(dueDate, has_time) {
            const dateTimeParts = dueDate.split('T');
            const datePart = dateTimeParts[0];
            if (!has_time) {
                return `${datePart}`;

            }
            const timePart = dateTimeParts[1].split(':');
            const formattedTime = `${timePart[0]}:${timePart[1]}`;
            return `${formattedTime} ${datePart}`;
        },
        filteredTasksByType(type) {
            return this.tasks.filter(task => task.task_type === type);
        },
        getSubtasks(taskId) {
            return this.tasks.filter(task => task.parent_task === taskId);
        },

    },
    mounted() {
        this.fetchTasks().then(() => {
            console.log(this.tasks);
        });

        this.test();
    },
    computed: {}

});
