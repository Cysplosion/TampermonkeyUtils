GM_addStyle(`
.KD_Icon-button {
    background: none;
    border: none;
    padding: 0px;
}

.KD_Icon-button__Image {
    height: 30px;
    border-width: 2px;
    border-radius: 3px;
    padding: 2px;
}

.KD_Border--solid {
    border: solid;
}

.KD_Border--none {
    border: none;
}
`);

class Icons {
    //#region Images
    static get Icon_Copy() {return "https://i.imgur.com/YlfFC7M.png";}
    static get Icon_Open() {return "https://i.imgur.com/dx5IgCj.png";}
    static get Icon_Download() {return "https://i.imgur.com/HOC9fqY.png";}
    static get Icon_BookMark() {return "https://i.imgur.com/YoPd2D3.png"};
    static get Icon_Refresh() {return "https://i.imgur.com/jcDxUdx.png"};
    static get Icon_Stack() {return "https://i.imgur.com/H5AL5OJ.png"};
    static get Icon_Cancel() {return "https://i.imgur.com/P7EKeAp.png"};
    static get Icon_Delete() {return "https://imgur.com/NHMKfod.png"};
    static get Icon_Save() {return "https://i.imgur.com/8Ph6Scl.png"};
    static get Icon_Plus() {return "https://i.imgur.com/aCVTlVI.png"};
    static get Icon_Reset() {return "https://i.imgur.com/GulF9MY.png"};
    //#endregion
}

/**
     * Creates a Button with an icon
     * @param {*} icon 
     * @param {*} showBorder 
     * @returns 
     */
function CreateIconButton(icon, showBorder = true) {
    const button = document.createElement("Button");
    button.className ="KD_Icon-button";

    const image = document.createElement("Img");
    image.classList.add("KD_Icon-button__Image");
    image.classList.add(`KD_Border--${showBorder ? "solid" : "none"}`);
    image.src = icon;
    button.innerHTML = image.outerHTML;
    return button;
}
