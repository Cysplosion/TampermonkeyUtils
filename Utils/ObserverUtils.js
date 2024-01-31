 function CreateObserver(observeConditions, action = undefined, disconnectWhenFound = true) {
    return new MutationObserver(function(mutationsList) {
        for (let mutation of mutationsList) {
            if(mutation.type !== 'childList') {
                continue;
            }
    
            for(let addedNode of mutation.addedNodes) {
                if(!observeConditions(addedNode)) {
                    continue;
                }
    
                if(disconnectWhenFound)
                    this.disconnect();

                if(action)
                    action(addedNode);
                else
                    console.log(addedNode);
            }
        }
    });
}

function CreateClassObserver(nodeClass, action = undefined, dcWhenFound = true) {
    return CreateObserver((node)=>node.nodeType === Node.ELEMENT_NODE && node.getAttribute("class") === nodeClass, action, dcWhenFound)
}

function StartObserver(observer, options = { childList: true, subtree: true }, element = document) {
    observer.observe(element, options);
}

function ObserveAll() {
    StartObserver(CreateObserver(()=>true, undefined, false));
}

function GetParent(element, generations = 1) {
    if(generations < 1) 
        return element;
    if(element.parentElement)
        return GetParent(element.parentElement, generations-1);

    return element;
}