class CMS extends HTMLElement {
    constructor() {
        super();
        this.table = null;
        this.form = null;
        this.tableHeader = [
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
        this.table = document.createElement("table");
        this.table.classList.add("styled-table");
        this.table.append(this.createTableHeader(this.tableHeader));
        this.append(this.table);
        this.form = this.createFormSection(this.tableHeader);
        this.append(this.form);
    }

    createTableHeader(headerNames) {
        const tableRow = document.createElement("tr");
        tableRow.classList.add("table-header-row");
        headerNames.forEach((element) => {
            const tableHeader = document.createElement("th");
            tableHeader.classList.add("table-cell");
            tableHeader.innerText = element;
            tableRow.append(tableHeader);
        });
        return tableRow;
    }

    createFormSection(headerNames) {
        const form = document.createElement("form");
        headerNames.forEach((element) => {
            if (element === "Sex") {
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
                form.append(label, select);
                return;
            }
            if (element === "Date of birth") {
                const label = document.createElement("label");
                label.for = element.replace(/ /g, "");
                label.innerText = element + ":";
                const input = document.createElement("input");
                input.required = true;
                input.type = "date";
                input.id = element.replace(/ /g, "");
                form.append(label, input);
                return;
            }

            if (element === "Profile Image") {
                return;
            }

            const label = document.createElement("label");
            label.for = element.replace(/ /g, "");
            label.innerText = element + ":";
            const input = document.createElement("input");
            input.id = element.replace(/ /g, "");
            input.required = true;
            input.type = "text";
            form.append(label, input);
        });
        const submit = document.createElement("input");
        submit.type = "submit";
        form.onsubmit = (event) => this.saveDataOnClickSubmit(event);
        form.append(submit);
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
                        return;
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
    }

    _getLastId(dataFromDataBase) {
        if (!dataFromDataBase) {
            return 0;
        }
        return dataFromDataBase[dataFromDataBase.length - 1].id;
    }
}

window.customElements.define("cms-component", CMS);