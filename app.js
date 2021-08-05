class CMS extends HTMLElement {
    constructor() {
        super();
        this.table = null;
        this.form = null;
        this.tableHeader = [
            "Id",
            "Firstname",
            "Lastname",
            "Email",
            "Sex",
            "Date of birth",
            "Profile Image"
        ];
        this.myStorage = window.localStorage;
        this.dataBaseKey = "Employees";
        this.imageDatabaseKey = "Images";
    }

    connectedCallback() {
        console.log("CMS connected!");
        this.render();
    }

    disconnectedCallbacK() {
        console.log("CMS disconnected!");
    }

    render() {
        console.log("Rendering the CMS!");
        this.form = this.createFormSection(this.tableHeader);
        this.append(this.form);
        this.table = document.createElement("table");
        this.table.classList.add("styled-table");
        this.table.append(this.createTableHeader(this.tableHeader));
        let dataFromDataBase = this.myStorage.getItem(this.dataBaseKey);
        dataFromDataBase = JSON.parse(dataFromDataBase);
        if (!dataFromDataBase) {
            console.log("Nothing to show");
        } else {
            dataFromDataBase.forEach((element) => {
                this.table.append(this.createTableRow(element));
            });
        }
        this.append(this.table);
    }

    createTableHeader(headerNames) {
        const tableRow = document.createElement("tr");
        tableRow.classList.add("table-header-row");
        headerNames.forEach((element) => {
            const tableHeader = document.createElement("th");
            tableHeader.innerText = element;
            tableHeader.classList.add('tabble-cell');
            tableRow.append(tableHeader);
        });
        const tableHeader = document.createElement('th');
        tableHeader.classList.add('table-cell');
        tableHeader.innerText = "Delete Employee"
        tableRow.append(tableHeader);
        return tableRow;
    }

    createTableRow(data) {
        const tableRow = document.createElement("tr");
        tableRow.classList.add("table-body-row");
        for (let x in data) {
            const tableCell = document.createElement("td");
            tableCell.innerText = data[x];
            tableCell.classList.add('tabble-cell');
            tableRow.append(tableCell);
        }
        const deleteCell = document.createElement("td");
        deleteCell.classList.add('table-cell');
        const deleteButton = document.createElement('button');
        deleteButton.onclick = () => this._deleteEmployee(data.id);
        deleteButton.innerText = "X";
        deleteCell.append(deleteButton);
        tableRow.append(deleteCell);
        return tableRow;
    }

    createFormSection(headerNames) {
        const form = document.createElement("form");
        form.classList.add("styled-form");
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('form-row');

        const h1 = document.createElement('h1');
        h1.innerText = "Add a new employee to the list:";
        headerDiv.append(h1);
        form.append(headerDiv);
        headerNames.forEach((element) => {
            switch (element) {
                case "Sex":
                    {
                        const div = document.createElement('div');
                        div.classList.add('form-row');
                        const label = document.createElement("label");
                        label.for = element.replace(/ /g, "");
                        label.innerText = element + ":";
                        const select = document.createElement("select");
                        select.name = element.replace(/ /g, "");
                        select.id = element.replace(/ /g, "");
                        const male = document.createElement("option");
                        male.value = "Male";
                        male.innerText = "Male";
                        const female = document.createElement("option");
                        female.value = "Female";
                        female.innerText = "Female";
                        select.append(male, female);
                        div.append(label, select);
                        form.append(div);
                        break;
                    }
                case "Date of birth":
                    {
                        const div = document.createElement('div');
                        div.classList.add('form-row');
                        const label = document.createElement("label");
                        label.for = element.replace(/ /g, "");
                        label.innerText = element + ":";
                        const input = document.createElement("input");
                        input.required = true;
                        input.type = "date";
                        input.id = element.replace(/ /g, "");
                        div.append(label, input);
                        form.append(div);
                        break;
                    }
                case "Id":
                    {
                        break;
                    }
                case "Profile Image":
                    {
                        const elementId = element.replace(/ /g, "");
                        const div = document.createElement('div');
                        div.classList.add('form-row');
                        const label = document.createElement("label");
                        label.for = elementId;
                        label.innerText = element + ":";
                        const input = document.createElement("input");
                        input.id = elementId;
                        input.name = elementId;
                        input.accept = "image/png, image/jpeg";
                        input.required = true;
                        input.type = "file";
                        div.append(label, input);
                        form.append(div);
                        break;
                    }
                case "Email":
                    {
                        const div = document.createElement('div');
                        div.classList.add('form-row');
                        const label = document.createElement("label");
                        label.for = element.replace(/ /g, "");
                        label.innerText = element + ":";
                        const input = document.createElement("input");
                        input.id = element.replace(/ /g, "");
                        input.required = true;
                        input.type = "email";
                        input.placeholder = element;
                        div.append(label, input);
                        form.append(div);
                        break;
                    }
                default:
                    {
                        const div = document.createElement('div');
                        div.classList.add('form-row');
                        const label = document.createElement("label");
                        label.for = element.replace(/ /g, "");
                        label.innerText = element + ":";
                        const input = document.createElement("input");
                        input.id = element.replace(/ /g, "");
                        input.required = true;
                        input.type = "text";
                        input.placeholder = element;
                        div.append(label, input);
                        form.append(div);
                    }
            }
        });
        const div = document.createElement('div');
        div.classList.add('form-row');
        const submit = document.createElement("input");
        submit.type = "submit";
        form.onsubmit = (event) => this.saveDataOnClickSubmit(event);
        div.append(submit);
        form.append(div);
        return form;
    }

    saveDataOnClickSubmit(event) {
        event.preventDefault();
        console.log("Handling Data Saving");
        let dataFromDataBase = this.myStorage.getItem(this.dataBaseKey);
        dataFromDataBase = JSON.parse(dataFromDataBase);
        let newEmployee = {};
        let employeeId = this._getLastId(dataFromDataBase) + 1;
        newEmployee["id"] = employeeId;
        this.tableHeader.forEach((element) => {
            switch (element) {
                case "Profile Image":
                    {
                        newEmployee[element.replace(/ /g, "")] = null;
                        let imageFile = this.form.querySelector(
                            `#${element.replace(/ /g, "")}`
                        ).files[0];

                        _turnImageToBase64(imageFile).then(data => {
                            let imageStorage = this.myStorage.getItem(this.imageDatabaseKey);
                            imageStorage = JSON.parse(imageStorage);
                            if (!imageStorage) {
                                imageStorage = [];
                            }
                            let userImage = {};
                            userImage.id = employeeId;
                            userImage.image = data;
                            imageStorage.push(userImage);
                            this.myStorage.setItem(this.imageDatabaseKey, JSON.stringify(imageStorage));

                        });
                        break;
                    }
                case "Id":
                    {
                        break;
                    }
                default:
                    {
                        newEmployee[element.replace(/ /g, "")] = this.form.querySelector(
                            `#${element.replace(/ /g, "")}`
                        ).value;

                        break;
                    }
            }
        });
        if (!dataFromDataBase) {
            dataFromDataBase = [];
        }
        dataFromDataBase.push(newEmployee);
        this.myStorage.setItem(this.dataBaseKey, JSON.stringify(dataFromDataBase));
        this.form.reset();
        this.table.append(
            this.createTableRow(dataFromDataBase[dataFromDataBase.length - 1])
        );
    }

    _getLastId(dataFromDataBase) {
        if (!dataFromDataBase) {
            return 0;
        }
        return dataFromDataBase[dataFromDataBase.length - 1].id;
    }

    _deleteEmployee(id) {
        console.log("Delete employee with id: " + id);
        let dataFromDataBase = this.myStorage.getItem(this.dataBaseKey);
        dataFromDataBase = JSON.parse(dataFromDataBase);
        let indexOfDeleted = dataFromDataBase.findIndex((element) => {
            if (element.id === id) {
                return true;
            }
        });
        this.table.removeChild(this.table.childNodes[indexOfDeleted + 1]);
        dataFromDataBase = dataFromDataBase.filter(function(obj) {
            return obj.id !== id;
        });
        this.myStorage.setItem(this.dataBaseKey, JSON.stringify(dataFromDataBase));
    }
}

function _turnImageToBase64(element) {
    return new Promise((resolve, reject) => {
        let file = element;
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

window.customElements.define("cms-component", CMS);