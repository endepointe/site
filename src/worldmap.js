import html from './world-map.html';
// 2000 x 857
class WorldMap extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement("template");
        template.innerHTML = html;
        const shadowRoot = this.attachShadow({mode: "open"});
        shadowRoot.appendChild(template.content.cloneNode(true));
    }
};

customElements.define('world-map', WorldMap);
