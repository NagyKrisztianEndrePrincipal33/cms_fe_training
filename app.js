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
        this.imageDatabaseKey = "Images";
        this.tooltip = null;
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
        this.tooltip = this.createToolTip();
        const tableContainer = document.createElement("div");
        tableContainer.classList.add("table-container");
        tableContainer.append(this.table);
        this.append(tableContainer);
        this.append(this.tooltip);
    }

    createToolTip() {
        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.classList.toggle("hide");
        return tooltip;
    }

    createTableHeader(headerNames) {
        const tableRow = document.createElement("tr");
        tableRow.classList.add("table-header-row");
        headerNames.forEach((element) => {
            const tableHeader = document.createElement("th");
            tableHeader.classList.add("tabble-cell");
            const wrapper = document.createElement("div");
            wrapper.classList.add("table-header-cell");
            let button = document.createElement("i");
            button.classList.add("arrow");
            button.classList.add("right");
            let inc = 0;
            button.onclick = (event) => {
                // inc = inc + 1;
                this._sortByColumn(event, element.replace(/ /g, ""), inc % 2);
            };
            const text = document.createElement("p");
            text.innerText = element;
            wrapper.append(button, text);
            tableHeader.append(wrapper);

            tableRow.append(tableHeader);
        });
        const tableHeader = document.createElement("th");
        tableHeader.classList.add("table-cell");
        const text = document.createElement("p");
        text.innerText = "Delete Employee";
        tableHeader.append(text);
        // tableHeader.innerText = "Delete Employee"
        tableRow.append(tableHeader);
        return tableRow;
    }

    createTableRow(data) {
        const tableRow = document.createElement("tr");
        tableRow.classList.add("table-body-row");
        for (let x in data) {
            if (x === "ProfileImage") {
                let image = this._getImage(data.id);
                if (image) {
                    const tableCell = document.createElement("td");
                    tableCell.classList.add("tabble-cell");
                    const imageContainer = document.createElement("div");
                    imageContainer.classList.add("profile-image-cell");
                    imageContainer.style = `background-image : url(${image})`;
                    tableCell.append(imageContainer);
                    tableRow.append(tableCell);
                } else {
                    const tableCell = document.createElement("td");
                    tableCell.classList.add("tabble-cell");
                    tableCell.innerText = "No Image Here";
                    tableRow.append(tableCell);
                }

                continue;
            }
            if (x === "Dateofbirth") {
                const tableCell = document.createElement("td");
                moment.locale("ro");
                tableCell.innerText = moment(data[x]).format("LL");
                tableCell.classList.add("tabble-cell");
                tableCell.onmousemove = (event) => {
                    this._onMouseOverHover(event);
                };
                tableCell.onmouseout = (event) => {
                    this._onMouseOutHover(event);
                };
                tableCell.onmouseenter = (event) => {
                    this._onMouseInHover(event);
                };
                tableRow.append(tableCell);
                continue;
            }
            if (x === "Firstname") {
                const tableCell = document.createElement("td");
                let image = this._getImage(data.id);
                if (image) {
                    const p = document.createElement("p");
                    p.innerText = data[x];
                    const imageContainer = document.createElement("div");
                    imageContainer.classList.add("profile-image-cell");
                    imageContainer.style = `background-image : url(${image})`;
                    tableCell.append(imageContainer, p);
                    tableCell.classList.add("table-cell-with-image-and-paragraph");
                } else {
                    tableCell.innerText = data[x];
                }
                tableCell.classList.add("tabble-cell");
                tableRow.append(tableCell);
                continue;
            }
            const tableCell = document.createElement("td");
            tableCell.innerText = data[x];
            tableCell.classList.add("tabble-cell");
            tableCell.onmousemove = (event) => {
                this._onMouseOverHover(event);
            };
            tableCell.onmouseout = (event) => {
                this._onMouseOutHover(event);
            };
            tableCell.onmouseenter = (event) => {
                this._onMouseInHover(event);
            };
            tableRow.append(tableCell);
        }
        const deleteCell = document.createElement("td");
        deleteCell.classList.add("table-cell");
        const deleteButton = document.createElement("button");
        deleteButton.onclick = () => {
            this._deleteEmployee(data.id);
            this._deleteEmployeeImage(data.id);
        };
        deleteButton.innerText = "X";
        deleteCell.append(deleteButton);
        tableRow.append(deleteCell);
        return tableRow;
    }

    createFormSection(headerNames) {
        const form = document.createElement("form");
        form.classList.add("styled-form");
        const headerDiv = document.createElement("div");
        headerDiv.classList.add("form-row");

        const h1 = document.createElement("h1");
        h1.innerText = "Add a new employee to the list:";
        headerDiv.append(h1);
        form.append(headerDiv);
        headerNames.forEach((element) => {
            switch (element) {
                case "Sex":
                    {
                        const div = document.createElement("div");
                        div.classList.add("form-row");
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
                        const div = document.createElement("div");
                        div.classList.add("form-row");
                        const label = document.createElement("label");
                        label.for = element.replace(/ /g, "");
                        label.innerText = element + ":";
                        const input = document.createElement("input");
                        input.required = true;
                        input.type = "date";
                        input.max = "2018-01-01";
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
                        const div = document.createElement("div");
                        div.classList.add("form-row");
                        const label = document.createElement("label");
                        label.for = elementId;
                        label.innerText = element + ":";
                        const input = document.createElement("input");
                        input.id = elementId;
                        input.name = elementId;
                        input.accept = "image/png, image/jpeg";
                        input.required = true;
                        input.classList.add("input-type-file");
                        input.type = "file";
                        div.append(label, input);
                        form.append(div);
                        break;
                    }
                case "Email":
                    {
                        const div = document.createElement("div");
                        div.classList.add("form-row");
                        const label = document.createElement("label");
                        label.for = element.replace(/ /g, "");
                        label.innerText = element + ":";
                        const input = document.createElement("input");
                        input.id = element.replace(/ /g, "");
                        input.required = true;
                        input.type = "email";
                        // input.pattern = "/^\S+@\S+$/";
                        // input.pattern = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                        // input.setAttribute('pattern', "/^\S+@\S+$/");
                        input.placeholder = element;
                        div.append(label, input);
                        form.append(div);
                        break;
                    }
                default:
                    {
                        const div = document.createElement("div");
                        div.classList.add("form-row");
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
        const div = document.createElement("div");
        div.classList.add("form-row");
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
                        return;
                    }
                case "Id":
                    {
                        return;
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
        let imageCase = "Profile Image";
        imageCase = imageCase.replace(/ /g, "");
        newEmployee[imageCase] = null;
        let imageFile = this.form.querySelector(`#${imageCase}`).files[0];

        _turnImageToBase64(imageFile).then((data) => {
            let imageStorage = this.myStorage.getItem(this.imageDatabaseKey);
            imageStorage = JSON.parse(imageStorage);
            if (!imageStorage) {
                imageStorage = [];
            }
            let userImage = {};
            userImage.id = employeeId;
            userImage.image = data;
            imageStorage.push(userImage);
            this.myStorage.setItem(
                this.imageDatabaseKey,
                JSON.stringify(imageStorage)
            );
            if (!dataFromDataBase) {
                dataFromDataBase = [];
            }
            dataFromDataBase.push(newEmployee);
            this.myStorage.setItem(
                this.dataBaseKey,
                JSON.stringify(dataFromDataBase)
            );
            this.form.reset();
            this.table.append(
                this.createTableRow(dataFromDataBase[dataFromDataBase.length - 1])
            );
        });
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

    _deleteEmployeeImage(id) {
        let imagesFromDataBase = this.myStorage.getItem(this.imageDatabaseKey);
        imagesFromDataBase = JSON.parse(imagesFromDataBase);
        imagesFromDataBase = imagesFromDataBase.filter(function(obj) {
            return obj.id !== id;
        });
        this.myStorage.setItem(
            this.imageDatabaseKey,
            JSON.stringify(imagesFromDataBase)
        );
    }

    _getImage(id) {
        let imageFromDatabase = this.myStorage.getItem(this.imageDatabaseKey);
        imageFromDatabase = JSON.parse(imageFromDatabase);
        let indexOfNeeded = imageFromDatabase.findIndex((element) => {
            if (element.id === id) {
                return true;
            }
        });
        if (indexOfNeeded === -1) {
            return null;
        } else {
            return imageFromDatabase[indexOfNeeded].image;
        }
    }

    _onMouseInHover(event) {
        this.tooltip.classList.remove("hide");
        const item = event.target;
        const copy = item.cloneNode(true);
        this.tooltip.append(copy);
    }

    _onMouseOverHover(event) {
        this.tooltip.style.left = event.pageX + "px";
        this.tooltip.style.top = event.pageY + "px";
    }

    _onMouseOutHover(event) {
        this.tooltip.classList.add("hide");
        this.tooltip.innerHTML = `
            `;
    }

    _sortByColumn(event, column, direction) {
        let dataFromDataBase = this.myStorage.getItem(this.dataBaseKey);
        dataFromDataBase = JSON.parse(dataFromDataBase);
        dataFromDataBase.sort((a, b) => {
            let firstValue = a[column];
            let secondValue = b[column];
            if (typeof firstValue === "string" && column != "Dateofbirth") {
                if (direction) {
                    return !firstValue.localeCompare(secondValue);
                }
                return firstValue.localeCompare(secondValue);
            } else {
                if (typeof firstValue === "string" && column === "Dateofbirth") {
                    if (direction === 1) {
                        return moment(secondValue, 'LL').isBefore(firstValue, 'LL');
                    }
                    return moment(firstValue, 'LL').isBefore(secondValue, 'LL');
                }
            }
        });
        this._reRender(dataFromDataBase);
    }

    _reRender(data) {
        this.table.innerHTML = "";
        this.table.append(this.createTableHeader(this.tableHeader));
        if (!data) {
            console.log("Nothing to show");
        } else {
            data.forEach((element) => {
                this.table.append(this.createTableRow(element));
            });
        }
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