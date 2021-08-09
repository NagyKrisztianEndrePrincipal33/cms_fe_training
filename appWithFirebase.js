var firebaseConfig = {
    apiKey: "AIzaSyAzcm0C7N7__-vAHe0COrSCEO7Kcusdznw",
    authDomain: "contact-management-syste-a22c9.firebaseapp.com",
    projectId: "contact-management-syste-a22c9",
    storageBucket: "contact-management-syste-a22c9.appspot.com",
    messagingSenderId: "309239271351",
    appId: "1:309239271351:web:7336060d79c5a47c85a232",
    measurementId: "G-46HB65HQQD"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();
const storage = firebase.storage();

let useFirebase = false;

const defaultImage = "https://firebasestorage.googleapis.com/v0/b/contact-management-syste-a22c9.appspot.com/o/images%2FEmployee-Placeholder-Image-e1555622993894.jpg?alt=media&token=9d52a5eb-810b-4bd1-80b0-0c4335654b9b";

moment.locale("ro");

class CMS extends HTMLElement {
    constructor() {
        super();
        this.table = null;
        this.form = null;
        this.tableHeader = [
            "Profile Image",
            "Firstname",
            "Lastname",
            "Email",
            "Sex",
            "Date of birth",

        ];
        this.myStorage = window.localStorage;
        this.dataBaseKey = "Employees";
        this.imageDatabaseKey = "Images";
        this.tooltip = null;
        this.selectors = {
            firstName: 'Firstname',
            lastName: 'Lastname',
            email: 'Email',
            sex: 'Sex',
            dateOfBirth: 'Dateofbirth',
            profileImage: 'ProfileImage'
        };
        this.data = [];
    }

    connectedCallback() {
        console.log("CMS connected!");
        db.collection('employees').get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let temp = {};
                    temp.id = doc.id;
                    temp.data = doc.data();
                    this.data.push(temp);
                });
                this.render();
            })
            .catch(error => {
                this.createErrorMessage(error);
            });
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
        this.data.forEach((element) => {
            this.table.append(this.createTableRow(element));
        });
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

    createErrorMessage(text) {
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('errorPopup');
        errorDiv.innerHTML = text;
        this.append(errorDiv);
        setTimeout(() => {
            this.removeChild(errorDiv);
        }, 3000);
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
        tableRow.append(tableHeader);
        return tableRow;
    }

    createTableRow(data) {
        const id = data.id;
        data = data.data;
        const tableRow = document.createElement("tr");
        tableRow.classList.add("table-body-row");
        let image = data.profileImage;
        if (image) {
            const tableCell = document.createElement("td");
            tableCell.classList.add("tabble-cell");
            const imageContainer = document.createElement("div");
            imageContainer.classList.add("profile-image-cell");
            imageContainer.style = `background-image : url(${image})`;
            tableCell.append(imageContainer);
            tableRow.append(tableCell);
        } else {
            tableRow.append(this._createTableCell("No Image Here"));
        }

        tableRow.append(this._createTableCell(data.firstName));
        tableRow.append(this._createTableCell(data.lastName));
        tableRow.append(this._createTableCell(data.email));
        tableRow.append(this._createTableCell(data.sex));
        tableRow.append(this._createTableCell(moment(data.dateOfBirth).format('LL')));

        tableRow.id = id;

        const deleteCell = document.createElement("td");
        deleteCell.classList.add("table-cell");
        const deleteButton = document.createElement("button");
        deleteButton.onclick = () => {
            this._deleteEmployee(id);
        };
        deleteButton.innerText = "X";
        deleteCell.append(deleteButton);
        tableRow.append(deleteCell);
        return tableRow;
    }

    _createTableCell(text) {
        const tableCell = document.createElement("td");
        tableCell.classList.add("tabble-cell");
        tableCell.innerText = text;
        tableCell.onmousemove = (event) => {
            this._onMouseOverHover(event);
        };
        tableCell.onmouseout = (event) => {
            this._onMouseOutHover(event);
        };
        tableCell.onmouseenter = (event) => {
            this._onMouseInHover(event);
        };
        return tableCell;
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
                        // input.required = true;
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
        const textRegex = /^[a-zA-z ]*$/;
        let firstName = this.form.querySelector(`#${this.selectors.firstName}`).value;
        if (!textRegex.test(firstName)) {
            this.createErrorMessage('The firstname field should contain only letters!');
            return;
        }
        let lastName = this.form.querySelector(`#${this.selectors.lastName}`).value;
        if (!textRegex.test(lastName)) {
            this.createErrorMessage("The lastname field should contain only letters!");
            return;
        }
        const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        let email = this.form.querySelector(`#${this.selectors.email}`).value;
        if (!emailRegex.test(email)) {
            this.createErrorMessage("The email field should contain a real email!");
            return;
        }
        let sex = this.form.querySelector(`#${this.selectors.sex}`).value;
        if (!sex) {
            this.createErrorMessage("The sex value should be selected!");
            return;
        }
        let dateOfBirth = this.form.querySelector(`#${this.selectors.dateOfBirth}`).value;
        if (!dateOfBirth) {
            this.createErrorMessage("The date of birth should be selected!");
            return;
        }
        let temp = this.data.filter(obj => {
            return obj.data.email === email;
        });
        if (temp.length > 0) {
            this.createErrorMessage('The employee with this email is allready in the table');
            return;
        }
        let imagePath = this.form.querySelector(`#${this.selectors.profileImage}`).files[0];
        if (imagePath) {
            let imageName = imagePath.name;
            let storageRef = storage.ref('images/' + imageName);
            storageRef.put(imagePath).then((snapshot) => {
                    console.log(snapshot);
                    if (snapshot.state === "success") {
                        snapshot.ref.getDownloadURL().then((url) => {
                                console.log(url);
                                let profileImage = url;
                                this._saveDataInFirebase(firstName, lastName, email, sex, dateOfBirth, profileImage);
                            })
                            .catch(error => {
                                this.createErrorMessage(error);
                            });
                    } else {
                        this.createErrorMessage("Something went wrong at image uploading!");
                        return;
                    }
                })
                .catch(error => {
                    this.createErrorMessage(error);
                });
        } else {
            let profileImage = defaultImage;
            this._saveDataInFirebase(firstName, lastName, email, sex, dateOfBirth, profileImage);
        }

    }

    _saveDataInFirebase(firstName, lastName, email, sex, dateOfBirth, profileImage) {
        const jsonObject = {};
        jsonObject.firstName = firstName;
        jsonObject.lastName = lastName;
        jsonObject.email = email;
        jsonObject.sex = sex;
        jsonObject.dateOfBirth = dateOfBirth;
        jsonObject.profileImage = profileImage;
        this.data.push(jsonObject);
        db.collection('employees').add(jsonObject).then((success) => {
                console.log('Data uploaded');
                let dataToRender = {};
                dataToRender.id = success.id;
                dataToRender.data = jsonObject;
                this.table.append(this.createTableRow(dataToRender));
            })
            .catch(error => {
                this.createErrorMessage(error);
            });
    }


    _deleteEmployee(id) {
        console.log("Delete employee with id: " + id);
        db.collection('employees').doc(id).delete().then(() => {
            console.log("Document successfully deleted!");
            this.table.removeChild(document.getElementById(id));
            this.data = this.data.filter(function(obj) {
                return obj.id !== id;
            });

        }).catch(error => {
            this.createErrorMessage(error);
        });
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


window.customElements.define("cms-component", CMS);