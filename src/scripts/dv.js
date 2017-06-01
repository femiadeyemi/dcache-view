(function(document) {
    'use strict';

    var app = document.querySelector('#app');

    // Sets app default base URL
    app.baseUrl = '/';

    // Listen for template bound event to know when bindings
    // have resolved and content has been stamped to the page
    app.addEventListener('dom-change', function() {
    });

    // See https://github.com/Polymer/polymer/issues/1381
    window.addEventListener('WebComponentsReady', function() {
        // imports are loaded and elements have been registered
        if (window.CONFIG.qos === undefined && window.CONFIG.isSomebody) {
            const apiEndPoint = window.CONFIG.webapiEndpoint;

            const qos = new QosBackendInformation(apiEndPoint, app.getAuthValue());
            qos.addEventListener('qos-backend-response', (e) => {
                window.CONFIG.qos = e.detail.response;
            });
        }
    });

    app.menuAction = function(){
        app.$.dfDrawerPanel.togglePanel();
    };

    /**
     * List directory -> use by other elements like:
     * list-row, pagination-button, hover-contextual
     */
    app.ls = function(path)
    {
        app.$.homedir.innerHTML = "";
        const el1 = new ViewFile(path);
        app.$.homedir.appendChild(el1);

        setTimeout(()=>{
            app.$.selectedTitle.querySelector("#pagination").innerHTML = "";

            const elRoot = new PaginationButton("Root", "/");
            if ( path == "/" || path == null || path == undefined || path.type == 'tap') {
                elRoot.querySelector('a').classList.add("active");
                app.$.selectedTitle.querySelector("#pagination").appendChild(elRoot);
                path = '/';
            } else {
                elRoot.querySelector('a').classList.remove("active");
                app.$.selectedTitle.querySelector("#pagination").appendChild(elRoot);
                const dirNames = path.split("/");
                let pt =  "";
                for (let i = 1; i < dirNames.length; i++) {
                    pt += "/" + dirNames[i];
                    const el = new PaginationButton(dirNames[i], pt);
                    el.querySelector('a').classList.remove("active");
                    if ( i == (dirNames.length-1) ) {
                        el.querySelector('a').classList.add("active");
                    }
                    app.$.selectedTitle.querySelector("#pagination").appendChild(el);
                }
            }
        },100);
    };

    app.lsHomeDir = function()
    {
        app.ls(window.CONFIG.homeDirectory);
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

    app.getAuthValue = function ()
    {
        if (sessionStorage.upauth !== undefined) {
            return sessionStorage.authType + ' ' + sessionStorage.upauth;
        } else {
            return "Basic " + window.btoa('anonymous:nopassword');
        }
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
            url: window.CONFIG.webapiEndpoint + 'namespace',
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
        app.$.homedir.querySelector('iron-list').selectionEnabled = false;
        setTimeout(()=>{app.$.homedir.querySelector('iron-list').selectionEnabled = true;},10)
    });
})(document);