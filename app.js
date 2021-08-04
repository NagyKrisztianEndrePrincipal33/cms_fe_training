class CMS extends HTMLElement {
    constructor() {
        super();
        this.table = null;
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
    }
}

window.customElements.define('cms-component', CMS);