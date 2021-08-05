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
            "Profile Image",
        ];
        this.myStorage = window.localStorage;
        this.dataBaseKey = "Employees";
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
            tableHeader.classList.add("table-cell");
            tableHeader.innerText = element;
            tableHeader.classList.add('tabble-cell');
            tableRow.append(tableHeader);
        });
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
            console.log(x);
        }
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
        newEmployee["id"] = this._getLastId(dataFromDataBase) + 1;
        this.tableHeader.forEach((element) => {
            switch (element) {
                case "Profile Image":
                    {
                        newEmployee[element.replace(/ /g, "")] = null;
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
}

window.customElements.define("cms-component", CMS);