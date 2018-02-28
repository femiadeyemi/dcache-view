(function(document) {
    'use strict';

    //console.info("Polymer version:", Polymer.version);

    var app = document.querySelector('#app');

    // Global variables for monitoring drag and drop activities
    let dndCounter = 0;
    let timeoutID, dndArr = [];
    app.closingTime = 3000;
    app.mvObj = {};

    // Sets app default base URL
    app.baseUrl = '/';

    // See https://github.com/Polymer/polymer/issues/1381
    window.addEventListener('WebComponentsReady', function() {
        // imports are loaded and elements have been registered
        const isSomebody = !(app.getAuthValue() ===
            `Basic ${window.btoa('anonymous:nopassword')}`);
        if (window.CONFIG.qos === undefined && isSomebody) {
            const qos = new QosBackendInformation();
            qos.auth = app.getAuthValue();
            qos.apiEndPoint = window.CONFIG["dcache-view.endpoints.webapi"];
            qos.addEventListener('qos-backend-response', (e) => {
                window.CONFIG.qos = e.detail.response;
            });
            qos.trigger();
        }
    });

    app.menuAction = function(){
        app.$.dvDrawerPanel.togglePanel();
    };

    /**
     * List directory -> use by other elements like:
     * list-row, pagination-button, hover-contextual
     */
    app.ls = function(path)
    {
        app.$.homedir.removeChild(app.$.homedir.querySelector('view-file'));
        const el1 = new ViewFile(path);
        app.$.homedir.appendChild(el1);

        setTimeout(()=>{
            app.$.selectedTitle.shadowRoot.querySelector("#pagination").innerHTML = "";

            const elRoot = new PaginationButton("Root", "/");
            app.$.selectedTitle.shadowRoot.querySelector("#pagination").appendChild(elRoot);
            if ( path == "/" || path == null || path == undefined || path.type == 'tap') {
                elRoot.shadowRoot.querySelector('a').classList.add("active");
            } else {
                elRoot.shadowRoot.querySelector('a').classList.remove("active");
                const dirNames = path.split("/");
                let pt =  "";
                for (let i = 1; i < dirNames.length; i++) {
                    pt += "/" + dirNames[i];
                    const el = new PaginationButton(dirNames[i], pt);
                    app.$.selectedTitle.shadowRoot.querySelector("#pagination").appendChild(el);
                    el.shadowRoot.querySelector('a').classList.remove("active");
                    if ( i == (dirNames.length-1) ) {
                        el.shadowRoot.querySelector('a').classList.add("active");
                    }
                }
            }
        },100);
        el1.__listDirectory();
    };

    app.lsHomeDir = function()
    {
        app.ls(sessionStorage.homeDirectory);
    };

    app.currentDirContext = function(e)
    {
        if (app.$.centralContextMenu.opened) {
            app.$.centralContextMenu.close();
        }
        app.$.centralContextMenu.innerHTML = "";

        let path = app.$.homedir.querySelector('view-file').path;
        let name;
        if (path === "/") {
            name = 'ROOT';
        } else {
            name = path.slice(path.lastIndexOf("/"));
        }
        let fm = {"name":name,"filePath":path, "fileType":"DIR"};
        let cc = new NamespaceContextualContent(fm, 2);
        app.$.centralContextMenu.appendChild(cc);
        let x = 0, y = 0;

        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else if (e.clientX || e.clientY) {
            x = e.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }

        const vx = window.innerWidth;
        const vy = window.innerHeight;
        const w = 250;
        const h = 176;

        if (vx - x < w && vy - y >= h) {
            app.x = x-w;
            app.y = y;
        } else if (vx - x < w && vy - y < h) {
            app.x = x-w;
            app.y = y-h;
        } else if (vx - x >= w && vy - y < h) {
            app.x = x;
            app.y = y-h;
        } else {
            app.x = x;
            app.y = y;
        }
        app.notifyPath('x');
        app.notifyPath('y');
        app.$.centralContextMenu.resetFit();
        app.$.centralContextMenu.open();
    };

    app.click = function (e) {
        this.dispatchEvent(
            new CustomEvent('reset-element-internal-parameters', {
                detail: {element: 'view-file'}, bubbles: true, composed: true}));
    };

    /**
     * Get the file name from the file path
     */
    app.getfileName = function (path)
    {
        if (path === null || path === "" || path === "/") {
            return 'Root';
        } else {
            let pt = path.endsWith('/') ? path.slice(0,-1): path;
            return pt.slice(pt.lastIndexOf('/')).substring(1);
        }
    };

    // Listing directory with time delay of @timeDelay
    app.delayedLs = function (path, timeDelay)
    {
        timeoutID = window.setTimeout(()=>{
            app.ls(path);
            dndArr = [];
            dndArr.length = 0;
        },timeDelay);
    };

    // abort request to delayed listing directory
    app.clearDelayedLs = function()
    {
        dndArr = [];
        dndArr.length = 0;
        window.clearTimeout(timeoutID);
    };

    app.delayTact = function (file)
    {
        dndArr.push(file);
        const len = dndArr.length;
        if (len === 1) {
            app.delayedLs(file.__data.filePath, 2000);
        } else if (dndArr[len - 1].__data.name !== dndArr[len - 2].__data.name) {
            app.clearDelayedLs();
        }
    };

    /**
     *
     * current view drag and drop events listeners
     */
    app.drop = function(e)
    {
        let event = e || event;
        event.preventDefault && event.preventDefault();
        let path = app.$.homedir.querySelector('view-file').path;
        if (event.dataTransfer.types.includes('text/plain')) {
            app.dragNdropMoveFiles(path, false);
        } else {
            app.$.dropZoneToast.close();
            let upload = new DndUpload(path);
            upload.start(event);
        }

        dndCounter = 0;
    };
    app.dragenter = function(e)
    {
        let event = e || event;
        event.preventDefault && event.preventDefault();
        dndCounter++;
        if (!event.dataTransfer.types.includes('text/plain')) {
            app.$.dropZoneContent.querySelector('drag-enter-toast').directoryName =
                app.getfileName(app.$.homedir.querySelector('view-file').path);
            if (!app.$.dropZoneToast.opened){
                app.$.dropZoneToast.open();
            }
        }
    };
    app.dragleave = function()
    {
        dndCounter--;
    };
    app.dragend = function()
    {
        dndCounter = 0;
    };
    app.dragexit = function()
    {
        dndCounter = 0;
    };

    app.checkBrowser = function ()
    {
        const ua = window.navigator.userAgent;
        let tem = [];
        let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i);

        if(/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+.?\d*)/g.exec(ua) || [];
            return {name: 'Internet Explorer', version: tem[1]};
        } else if(/firefox/i.test(M[1])) {
            tem = /\brv[ :]+(\d+.?\d*)/g.exec(ua) || [];
            return {name: 'Firefox', version: tem[1]};
        } else if(/safari/i.test(M[1])) {
            tem = ua.match(/\bVersion\/(\d+.?\d*\s*\w+)/);
            return {name: 'Safari', version: tem[1]};
        } else if(M[1] === 'Chrome') {
            //opera
            const temOpr = ua.match(/\b(OPR)\/(\d+.?\d*.?\d*.?\d*)/);
            //edge
            const temEdge = ua.match(/\b(Edge)\/(\d+.?\d*)/);
            //chrome
            const temChrome = ua.match(/\b(Chrome)\/(\d+.?\d*.?\d*.?\d*)/);
            let genuineChrome = temOpr === null && temEdge === null && temChrome !== null;

            if(temOpr !== null) {
                return {name: temOpr[1].replace('OPR', 'Opera'), version: temOpr[2]};
            }

            if(temEdge !== null) {
                return {name: temEdge[1], version: temEdge[2]};
            }

            if(genuineChrome) {
                return {name: temChrome[1], version: temChrome[2]};
            }
        }
    };

    /**
     * Reset the duration counter for the drag and drop Toast
     */
    app.dndToastClosed = function ()
    {
        app.closingTime = 3000;
    };

    app.getAuthValue = function ()
    {
        if (sessionStorage.upauth !== undefined) {
            return sessionStorage.authType + ' ' + sessionStorage.upauth;
        } else {
            return "Basic " + window.btoa('anonymous:nopassword');
        }
    };

    app.dragNdropMoveFiles = function (destinationPath, dropFlag)
    {
        const currentViewPath = app.$.homedir.querySelector('view-file').path;
        const sourcePath = ((app.mvObj.source).length > 1  && (app.mvObj.source).endsWith("/")) ?
            (app.mvObj.source).slice(0, -1) : app.mvObj.source;

        // prevent moving file if destination and source path are the same
        if (sourcePath === destinationPath) {
            return;
        }
        let errMsg;
        app.mvObj.files.forEach((file) => {
            let namespace = document.createElement('dcache-namespace');
            namespace.auth = app.getAuthValue();

            namespace.mv({
                url: "/api/v1/namespace",
                path: `${sourcePath}/${file.fileName}`,
                destination: `${destinationPath}/${file.fileName}`
            });

            namespace.promise.then( () => {
                if (currentViewPath === sourcePath) {
                    let vf = app.$.homedir.querySelector('view-file');
                    let list = vf.shadowRoot.querySelector('iron-list');
                    let arr = list.items;
                    const len = arr.length;

                    /**
                     * TODO: use associate-array or map or just the index number to
                     * remove the file from the list.
                     */
                    for (let i=0; i<len; i++) {
                        if (arr[i].fileName === file.fileName) {
                            list.splice('items', i, 1);
                            break;
                        }
                    }
                } else {
                    if (!dropFlag) {
                        let vf = app.$.homedir.querySelector('view-file');
                        let list = vf.shadowRoot.querySelector('iron-list');

                        let ed = vf.shadowRoot.querySelector('empty-directory');
                        if (!(ed === null || ed === undefined)) {
                            vf.shadowRoot.querySelector('#content').removeChild(ed);
                        }

                        if (list !== null || list !== undefined) {
                            list.unshift('items',
                                {
                                    "fileName" : file.fileName,
                                    "fileMimeType" : file.fileMimeType,
                                    "currentQos" : file.currentQos,
                                    "size" : file.fileType === "DIR"? "--": file.size,
                                    "fileType" : file.fileType,
                                    "mtime" : file.mtime,
                                    "creationTime" : file.creationTime
                                }
                            );
                            vf.shadowRoot.querySelector('iron-list').fire('iron-resize');
                        }
                    }
                }
            }).catch((err)=>{
                errMsg = err.message;
            });
        });

        if (errMsg === undefined) {
            const div = document.createElement('div');
            const boldSource = document.createElement('code');
            const boldDestination = document.createElement('code');
            boldSource.innerHTML = sourcePath;
            boldDestination.innerHTML = destinationPath;

            boldSource.setAttribute("style", "color:yellow; font-weight: bold;");
            boldDestination.setAttribute("style", "color:yellow; font-weight: bold;");

            div.appendChild(boldSource);
            div.appendChild(document.createTextNode(" to destination path: "));
            div.appendChild(boldDestination);
            div.appendChild(document.createTextNode(". "));
            div.setAttribute("style", "display:inline;");

            app.$.toast.text = app.mvObj.files.length + " files have been moved from source path: ";
            app.$.toast.insertBefore(div, app.$.toast.querySelector('span'));

            app.$.toast.addEventListener('iron-overlay-closed', ()=>{
                if (app.$.toast.contains(div)) {
                    app.$.toast.removeChild(div);
                }
            });
        } else {
            app.$.toast.text = errMsg;
        }
        app.$.toast.show();
        app.mvObj = {};
    };

    function updateFeListAndMetaDataDrawer(status, itemIndex)
    {
        if (app.$.metadata.selected == 'drawer'){
            app.$.metadata.querySelector('file-metadata').currentQos = status;
        }
        app.$.homeDir.querySelector('#feList')
            .set('items.'+itemIndex+'.currentQos', status);
        app.$.homeDir.querySelector('#feList').notifyPath('items.'+itemIndex+'.currentQos');
    }

    function periodicalCurrentQosRequest(options)
    {
        let namespace = document.createElement('dcache-namespace');
        namespace.auth = sessionStorage.upauth;
        namespace.promise.then( (req) => {
            if (req.response.targetQos !== undefined) {
                updateFeListAndMetaDataDrawer('&#8594; '+ options.targetQos, options.itemIndex);

                //ask every two seconds
                setTimeout(periodicalCurrentQosRequest(options), 2000);
            } else if (req.response.currentQos == options.targetQos) {
                updateFeListAndMetaDataDrawer(req.response.currentQos, options.itemIndex);

                app.$.toast.text = "Transition complete! ";
                app.$.toast.show();
            } else {
                updateFeListAndMetaDataDrawer(options.currentQos, options.itemIndex);

                app.$.toast.text = "Transition terminated. ";
                app.$.toast.show();
            }
        }).catch(
            function(err) {
                app.$.toast.text = err.message + " ";
                app.$.toast.show();
            }
        );
        namespace.getqos({
            url: window.CONFIG["dcache-view.endpoints.webapi"] + 'namespace',
            path: options.path
        });
    }

    window.addEventListener('qos-in-transition', function(event) {
        //make request after 0.1 seconds
        setTimeout(periodicalCurrentQosRequest(event.detail.options), 100);
    });

    window.addEventListener('paper-responsive-change', function (event) {
        var narrow = event.detail.narrow;
        app.$.mainMenu.hidden = !narrow;
    });

    //Ensure that paper-input in the dialog box is always focused
    window.addEventListener('iron-overlay-opened', function(event) {
        var input = event.target.querySelector('[autofocus]');
        if (input != null) {
            switch(input.tagName.toLowerCase()) {
                case 'input':
                    input.focus();
                    break;
                case 'paper-textarea':
                case 'paper-input':
                    input.$.input.focus();
                    break;
            }
        }
    });

    // Prevent the default context menu display from right click
    window.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });

    window.addEventListener('iron-overlay-canceled', ()=> {
        const vf = app.$.homedir.querySelector('view-file');
        vf.$.feList.selectionEnabled = false;
        setTimeout(() => {
            vf.$.feList.selectionEnabled = true;
        }, 10)
    });

    // Prevent drag and drop default behaviour on the page
    window.addEventListener('drag', function(event) {
        event.preventDefault();
        return false;
    });
    window.addEventListener('drop', function(event) {
        event.preventDefault();
        return false;
    });
    window.addEventListener('dragenter', function(event) {
        event.preventDefault();
        return false;
    });
    window.addEventListener('dragover', function(event) {
        event.preventDefault();
        return false;
    });
    window.addEventListener('admin-component-url-path', (evt)=>{
        page(evt.detail.path);
    });
})(document);