class VideoViewer extends Polymer.Element
{
    constructor(src)
    {
        super();

        if (src) this.src = src;
        this._stopListener = this._stop.bind(this);
    }
    /*ready()
    {
        Polymer.RenderStatus.afterNextRender(this, () => {
            const parentWidth = this.parentNode.offsetWidth;
            const parentHeight = this.parentNode.offsetHeight;

            //this._width =;
        })
    }*/
    static get is()
    {
        return 'video-viewer';
    }
    static get properties()
    {
        return {
            src: {
                type: String,
                notify: true
            },
            _width: {
                type: Number,
                notify: true
            },
            _height: {
                type: Number,
                notify: true
            }
        }
    }
    connectedCallback()
    {
        super.connectedCallback();
        this.$.video.addEventListener('loadeddata', this._setDimension.bind(this));
        window.addEventListener('dv-namespace-close-files-viewer-appliance', this._stopListener);
    }
    disconnectedCallback()
    {
        super.disconnectedCallback();
        window.removeEventListener('dv-namespace-close-files-viewer-appliance', this._stopListener);
    }
    static get observers()
    {
        return ['_load(src)'];
    }
    _load(src)
    {
        this.$.video.src = src;
    }
    _setDimension()
    {
        const parentWidth = this.parentNode.offsetWidth;
        const parentHeight = this.parentNode.offsetHeight;
        const videoWidth = this.$.video.videoWidth;
        const videoHeight = this.$.video.videoHeight;

        if (parentWidth < videoWidth && parentHeight > videoHeight) {
            this._width = 0.8 * parentWidth;
            this._height = (this._width * videoHeight)/videoWidth;
        } else if (parentHeight < videoHeight &&
            (parentWidth > videoWidth || parentWidth < videoWidth)) {
            this._height = 0.8 * parentHeight;
            this._width = (this._height * videoWidth)/videoHeight;
        } else {
            this._width = videoWidth;
            this._height = videoHeight;
        }
        this.$.video.classList.remove('none');
        this.dispatchEvent(
            new CustomEvent('dv-namespace-files-viewer-finished-loading', {bubbles:true, composed:true})
        );
        this.$.video.play();
    }
    _stop()
    {
        this.$.video.pause();
    }
}
window.customElements.define(VideoViewer.is, VideoViewer);