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
        this.elementNames = {
            profileImage: "Profile Image",
            firstName: "Firstname",
            lastName: "Lastname",
            email: "Email",
            sex: "Sex",
            dateOfBirth: "Date of birth",
        };
        this.selectors = {
            firstName: 'Firstname',
            lastName: 'Lastname',
            email: 'Email',
            sex: 'Sex',
            dateOfBirth: 'Dateofbirth',
            profileImage: 'ProfileImage'
        };
        this.data = [];
        this.filter = false;
        this.lastVisible = null;
        this.lastVisibleForPrev = null;
        this.next = null;
        this.queryLimit = 2;
        this.previous = null;
        this.filters = {
            keyword: {
                isActive: false,
                value: null,
            },
            sex: {
                isActive: false,
                value: null,
            },
            hasProfilePicture: {
                isActive: false,
                value: null,
            },
            bornBetween: {
                isActive: false,
                value: {
                    start: null,
                    end: null,
                }
            }
        };
        this.dataQuerry = null;
        this.queryTypes = {
            normal: "normal",
            next: "next",
            prev: "prev",
        }
    }

    connectedCallback() {
        console.log("CMS connected!");
        let first = db.collection('employees').orderBy('lastName').limit(this.queryLimit);
        first.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let temp = {};
                    temp.id = doc.id;
                    temp.data = doc.data();
                    this.data.push(temp);
                });
                this.__actualizeNext(querySnapshot);
                this.render();
            })
            .catch(error => {
                this.createErrorMessage(error);
                console.log(error);
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
        tableContainer.append(this.createFilters(), this.table, this._createPaginationButton());
        this.append(tableContainer);
        this.append(this.tooltip);
    }

    createFilters() {
        this.filteredData = [...this.data];
        const container = document.createElement('div');
        container.classList.add('filter-container');
        const showFilters = document.createElement('p');
        showFilters.innerText = 'Show filters';
        container.append(showFilters);
        const filtersContainer = document.createElement('div');
        filtersContainer.classList.add('real-filter-container');
        const labelForKeyword = document.createElement('label');
        labelForKeyword.for = "keyword";
        labelForKeyword.innerText = "Keyword: ";
        const searchByKeyWordInput = document.createElement('input');
        searchByKeyWordInput.type = "text";
        searchByKeyWordInput.placeholder = "Write here..";
        searchByKeyWordInput.name = "keyword";
        searchByKeyWordInput.addEventListener('input', () => {
            if (searchByKeyWordInput.value) {
                this.filters.keyword.isActive = true;
                this.filters.keyword.value = searchByKeyWordInput.value;
            } else {
                this.filters.keyword.isActive = false;
                this.filters.keyword.value = null;
            }
            db.collection('employees').get().then((querySnapshot) => {
                let tempData = [];
                querySnapshot.forEach((doc) => {
                    let temp = {};
                    temp.id = doc.id;
                    temp.data = doc.data();
                    tempData.push(temp);
                });
                let filteredData = [];
                for (let x of tempData) {
                    let tempText = x.data;
                    if ((tempText.email.includes(searchByKeyWordInput.value)) || (tempText.firstName.includes(searchByKeyWordInput.value)) || (tempText.lastName.includes(searchByKeyWordInput.value))) {
                        filteredData.push(x);
                    }
                }
                this._reRender(filteredData);
            }).catch(error => {
                console.log(error);
            });

        });
        filtersContainer.append(labelForKeyword, searchByKeyWordInput);
        const labelForSex = document.createElement('label');
        labelForSex.for = "sexFilter";
        labelForSex.innerText = "Sex: ";
        const sexFilter = document.createElement('select');
        sexFilter.name = "sexFilter";
        sexFilter.id = "sexFilter";
        const everySex = document.createElement('option');
        everySex.value = "every";
        everySex.innerText = "Every";
        const maleSex = document.createElement('option');
        maleSex.value = "male";
        maleSex.innerText = "Male";
        const femaleSex = document.createElement('option');
        femaleSex.value = "female";
        femaleSex.innerText = "Female";
        sexFilter.append(everySex, maleSex, femaleSex);
        sexFilter.onchange = () => {
            if (sexFilter.value === 'every') {
                this.filters.sex.isActive = false;
                this.filters.sex.value = null;
            } else {

            }
            switch (sexFilter.value) {
                case "every":
                    {
                        if (this.filters.sex.isActive) {
                            this.filters.sex.isActive = false;
                            this.filters.sex.value = null;
                        }
                        break;
                    }
                case "female":
                    {
                        if (!this.filters.sex.isActive) {
                            this.filters.sex.isActive = true;
                        }
                        this.filters.sex.value = 'Female';
                        break;
                    }
                case "male":
                    {
                        if (!this.filters.sex.isActive) {
                            this.filters.sex.isActive = true;
                        }
                        this.filters.sex.value = 'Male';
                        break;
                    }
            }
            let query = this.__createQuerry(this.queryTypes.normal);
            query.get().then((querySnapshot) => {
                    this.__handleQuerySnapshot(querySnapshot);
                })
                .catch(error => { console.log(error); });
        };
        filtersContainer.append(labelForSex, sexFilter);
        const labelForProfilePicture = document.createElement('label');
        labelForProfilePicture.for = 'filterForProfilePicture';
        labelForProfilePicture.innerText = "Has profile picture: ";
        const hasProfilePicture = document.createElement('select');
        hasProfilePicture.name = 'filterForProfilePicture';
        hasProfilePicture.id = 'filterForProfilePicture';
        const everyProfilePicture = document.createElement('option');
        everyProfilePicture.value = "every";
        everyProfilePicture.innerText = "Every";
        const onlyWhoHasProfilePicture = document.createElement('option');
        onlyWhoHasProfilePicture.value = "has";
        onlyWhoHasProfilePicture.innerText = "Has profile image";
        const doNotHave = document.createElement('option');
        doNotHave.value = "no";
        doNotHave.innerText = "Do not have";
        hasProfilePicture.append(everyProfilePicture, onlyWhoHasProfilePicture, doNotHave);
        hasProfilePicture.onchange = () => {
            switch (hasProfilePicture.value) {
                case "every":
                    {
                        this.filters.hasProfilePicture.isActive = false;
                        this.filters.hasProfilePicture.value = null;
                        break;
                    }
                case 'has':
                    {
                        if (!this.filters.hasProfilePicture.isActive) {
                            this.filters.hasProfilePicture.isActive = true;
                        }
                        this.filters.hasProfilePicture.value = hasProfilePicture.value;
                        break;
                    }
                case 'no':
                    {
                        if (!this.filters.hasProfilePicture.isActive) {
                            this.filters.hasProfilePicture.isActive = true;
                        }
                        this.filters.hasProfilePicture.value = hasProfilePicture.value;
                        break;
                    }
            }
            // if (hasProfilePicture.value === "every") {
            //     db.collection('employees').get()
            //         .then((querySnapshot) => {
            //             let tempData = [];
            //             querySnapshot.forEach((doc) => {
            //                 let temp = {};
            //                 temp.id = doc.id;
            //                 temp.data = doc.data();
            //                 tempData.push(temp);
            //             });
            //             this._reRender(tempData);
            //         })
            //         .catch(error => {
            //             console.log(error);
            //         })
            //     return;
            // }
            // if (hasProfilePicture.value === "has") {
            //     db.collection('employees')
            //         .where("profileImage", "!=", defaultImage)
            //         .get()
            //         .then((querySnapshot) => {
            //             let tempData = [];
            //             querySnapshot.forEach((doc) => {
            //                 let temp = {};
            //                 temp.id = doc.id;
            //                 temp.data = doc.data();
            //                 tempData.push(temp);
            //             });
            //             this._reRender(tempData);
            //         })
            //         .catch((error) => {
            //             console.log(error);
            //         });
            //     return;
            // }
            // if (hasProfilePicture.value === "no") {
            //     db.collection('employees')
            //         .where("profileImage", "==", defaultImage)
            //         .get()
            //         .then((querySnapshot) => {
            //             let tempData = [];
            //             querySnapshot.forEach((doc) => {
            //                 let temp = {};
            //                 temp.id = doc.id;
            //                 temp.data = doc.data();
            //                 tempData.push(temp);
            //             });
            //             this._reRender(tempData);
            //         })
            //         .catch((error) => {
            //             console.log(error);
            //         });
            //     return;
            // }
            let query = this.__createQuerry(this.queryTypes.normal);
            query.get().then((querySnapshot) => {
                    this.__handleQuerySnapshot(querySnapshot);
                })
                .catch(error => {
                    console.log(error);
                });
        };
        filtersContainer.append(labelForProfilePicture, hasProfilePicture);
        const labelForDates = document.createElement('label');
        labelForDates.for = 'dates';
        labelForDates.innerText = "Born between dates:";
        const startDate = document.createElement('input');
        startDate.type = 'date';
        startDate.max = moment().format('YYYY-MM-DD');
        const endDate = document.createElement('input');
        endDate.type = 'date';
        endDate.max = moment().format('YYYY-MM-DD');
        startDate.onchange = () => {
            endDate.min = startDate.value;
            if (endDate.value) {
                db.collection('employees').get()
                    .then((querySnapshot) => {
                        let tempData = [];
                        querySnapshot.forEach((doc) => {
                            let temp = {};
                            temp.id = doc.id;
                            temp.data = doc.data();
                            tempData.push(temp);
                        });
                        let filteredData = [];
                        for (let x of tempData) {
                            let tempObj = x.data;
                            if (moment(tempObj.dateOfBirth).isAfter(startDate.value) && moment(tempObj.dateOfBirth).isBefore(endDate.value)) {
                                filteredData.push(x);
                            }
                        }
                        this._reRender(filteredData);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }
        endDate.onchange = () => {
            startDate.max = endDate.value;
            if (startDate.value) {
                db.collection('employees').get()
                    .then((querySnapshot) => {
                        let tempData = [];
                        querySnapshot.forEach((doc) => {
                            let temp = {};
                            temp.id = doc.id;
                            temp.data = doc.data();
                            tempData.push(temp);
                        });
                        let filteredData = [];
                        for (let x of tempData) {
                            let tempObj = x.data;
                            if (moment(tempObj.dateOfBirth).isAfter(startDate.value) && moment(tempObj.dateOfBirth).isBefore(endDate.value)) {
                                filteredData.push(x);
                            }
                        }
                        this._reRender(filteredData);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }
        filtersContainer.append(labelForDates, startDate, endDate);
        showFilters.onclick = () => {
            if (!this.filter) {
                showFilters.innerText = "Unshow filters";
                container.append(filtersContainer);
                this.filter = true;
            } else {
                showFilters.innerText = 'Show filters';
                container.removeChild(filtersContainer);
                this.filter = false;
            }
        }
        return container;
    }

    __handleQuerySnapshot(querySnapshot) {
        let tempData = [];
        querySnapshot.forEach((doc) => {
            let temp = {};
            temp.id = doc.id;
            temp.data = doc.data();
            tempData.push(temp);
        });
        this.__actualizeNext(querySnapshot);
        this.__actualizePrev(querySnapshot);
        this._reRender(tempData);
    }

    _createPaginationButton() {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('pagination-button-container');
        const nextPage = document.createElement('button');
        nextPage.classList.add('pagination-button');
        nextPage.classList.add('pagination-next-page-button');
        nextPage.innerHTML = `<i class="fas fa-arrow-right"></i>`;
        nextPage.onclick = () => {
            this.next.get().then((querySnapshot) => {
                    this.data = [];
                    querySnapshot.forEach((doc) => {
                        let temp = {};
                        temp.id = doc.id;
                        temp.data = doc.data();
                        this.data.push(temp);
                    });
                    this.__actualizeNext(querySnapshot);
                    this.__actualizePrev(querySnapshot);
                    this._reRender();
                })
                .catch((error) => {
                    console.log(error);
                });
        };
        const prevPage = document.createElement('button');
        prevPage.classList.add('pagination-button');
        prevPage.classList.add("pagination-next-page-button")
        prevPage.innerHTML = `<i class="fas fa-arrow-left"></i>`;
        prevPage.onclick = () => {
            this.prev.get().then((querySnapshot) => {
                    this.data = [];
                    querySnapshot.forEach((doc) => {
                        let temp = {};
                        temp.id = doc.id;
                        temp.data = doc.data();
                        this.data.push(temp);
                    });
                    this.__actualizeNext(querySnapshot);
                    this.__actualizePrev(querySnapshot);
                    this._reRender();
                })
                .catch((error) => {
                    console.log(error);
                });
        };
        buttonContainer.append(prevPage, nextPage);
        return buttonContainer;
    }

    __actualizeNext(data) {
        this.lastVisible = data.docs[data.docs.length - 1];
        this.next = this.__createQuerry(this.queryTypes.next, this.lastVisible);
    }

    __actualizePrev(data) {
        this.lastVisibleForPrev = data.docs[0];
        this.prev = this.__createQuerry(this.queryTypes.prev, this.lastVisibleForPrev);
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

    __createTableHeaderCell(element) {
        const tableHeader = document.createElement("th");
        tableHeader.classList.add("tabble-cell");
        const wrapper = document.createElement("div");
        wrapper.classList.add("table-header-cell");
        const text = document.createElement("p");
        if (element !== this.elementNames.profileImage) {
            text.classList.add('clickable');
            text.onclick = (event) => {
                this._sortByColumn(event.target.innerText);
            };
        }
        text.innerText = element;
        wrapper.append(text);
        tableHeader.append(wrapper);
        return tableHeader;
    }

    createTableHeader(headerNames) {
        const tableRow = document.createElement("tr");
        tableRow.classList.add("table-header-row");

        tableRow.append(this.__createTableHeaderCell(this.elementNames.profileImage));
        tableRow.append(this.__createTableHeaderCell(this.elementNames.firstName));
        tableRow.append(this.__createTableHeaderCell(this.elementNames.lastName));
        tableRow.append(this.__createTableHeaderCell(this.elementNames.email));
        tableRow.append(this.__createTableHeaderCell(this.elementNames.sex));
        tableRow.append(this.__createTableHeaderCell(this.elementNames.dateOfBirth));

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

    __createDefaultFormField(element) {
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
        return div;
    }

    __createSexFormField(element) {
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
        return div;
    }

    __createDateOfBirthFormField(element) {
        const div = document.createElement("div");
        div.classList.add("form-row");
        const label = document.createElement("label");
        label.for = element.replace(/ /g, "");
        label.innerText = element + ":";
        const input = document.createElement("input");
        input.required = true;
        input.type = "date";
        input.max = moment().format('YYYY-MM-DD');
        input.id = element.replace(/ /g, "");
        div.append(label, input);
        return div;
    }

    __createEmailFormField(element) {
        const div = document.createElement("div");
        div.classList.add("form-row");
        const label = document.createElement("label");
        label.for = element.replace(/ /g, "");
        label.innerText = element + ":";
        const input = document.createElement("input");
        input.id = element.replace(/ /g, "");
        input.required = true;
        input.type = "email";
        input.placeholder = element;
        div.append(label, input);
        return div;
    }

    __createProfileImageFormField(element) {
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
        input.classList.add("input-type-file");
        input.type = "file";
        div.append(label, input);
        return div;
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
        form.append(this.__createDefaultFormField(this.elementNames.firstName));
        form.append(this.__createDefaultFormField(this.elementNames.lastName));
        form.append(this.__createEmailFormField(this.elementNames.email));
        form.append(this.__createSexFormField(this.elementNames.sex));
        form.append(this.__createDateOfBirthFormField(this.elementNames.dateOfBirth));
        form.append(this.__createProfileImageFormField(this.elementNames.profileImage));

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
        db.collection('employees').add(jsonObject).then((success) => {
                console.log('Data uploaded');
                let dataToRender = {};
                dataToRender.id = success.id;
                dataToRender.data = jsonObject;
                this.data.push(dataToRender);
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

    _sortByColumn(element) {
        let sortBy = null;
        switch (element) {
            case this.elementNames.firstName:
                {
                    sortBy = 'firstName';
                    break;
                }
            case this.elementNames.lastName:
                {
                    sortBy = 'lastName';
                    break;
                }
            case this.elementNames.email:
                {
                    sortBy = 'email';
                    break;
                }
            case this.elementNames.sex:
                {
                    sortBy = 'sex';
                    break;
                }
            case this.elementNames.dateOfBirth:
                {
                    sortBy = 'dateOfBirth';
                    break;
                }
            default:
                {
                    sortBy = 'firstName';
                }
        }

        this.data.sort((a, b) => {
            let firstValue = a.data[sortBy];
            let secondValue = b.data[sortBy];
            return firstValue.localeCompare(secondValue);
        });
        this._reRender();
    }

    _reRender(preData) {
        let data;
        if (preData) {
            data = preData;
        } else {
            data = this.data;
        }

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


    __createQuerry(queryType, param) {
        let query = db.collection('employees');
        if (this.filters.sex.isActive) {
            query = query.where('sex', "==", this.filters.sex.value);
        }
        if (this.filters.hasProfilePicture.isActive) {
            if (this.filters.hasProfilePicture.value === "no") {
                query = query.where("profileImage", "==", defaultImage);
            }
            if (this.filters.hasProfilePicture.value === "has") {
                query = query.where("profileImage", "!=", defaultImage);
                query = query.orderBy('profileImage');
            }
        }
        query = query.orderBy('lastName');
        switch (queryType) {
            case this.queryTypes.next:
                {
                    if (!param) {
                        console.error("There is no parameter!")
                        return;
                    }
                    query = query.startAfter(param);
                    query = query.limit(this.queryLimit);
                    break;
                }
            case this.queryTypes.prev:
                {
                    if (!param) {
                        console.error("There is no parameter!")
                        return;
                    }
                    query = query.endBefore(param);
                    query = query.limitToLast(this.queryLimit);
                    break;
                }
            case this.queryTypes.normal:
                {
                    query = query.limit(this.queryLimit);
                    break;
                }
        }
        return query;
    }

}


window.customElements.define("cms-component", CMS);