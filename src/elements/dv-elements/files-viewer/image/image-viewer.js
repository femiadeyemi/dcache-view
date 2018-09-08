class ImageViewer extends Polymer.Element
{
    constructor(src)
    {
        super();
        if (src) this.src = src;
        this._zoomInListener = this._zoomIn.bind(this);
        this._zoomOutListener = this._zoomOut.bind(this);
        this._rotateLeftListener = this._rotateLeft.bind(this);
        this._rotateRightListener = this._rotateRight.bind(this);
    }
    static get is()
    {
        return 'image-viewer';
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
                notify: true,
            },
            _height: {
                type: Number,
                notify: true,
            },
            _rotate: {
                type: Number,
                value: 0,
                notify: true,
            }
        }
    }
    static get observers()
    {
        return ['_loadImage(src)'];
    }
    connectedCallback()
    {
        super.connectedCallback();
        this.$.img.addEventListener('load', this._getImageDimension.bind(this));
        //TODO: add the error event

        window.addEventListener('dv-namespace-files-viewer-zoom-in', this._zoomInListener);
        window.addEventListener('dv-namespace-files-viewer-zoom-out', this._zoomOutListener);
        window.addEventListener('dv-namespace-files-viewer-rotate-left', this._rotateLeftListener);
        window.addEventListener('dv-namespace-files-viewer-rotate-right', this._rotateRightListener);
    }
    disconnectedCallback()
    {
        super.disconnectedCallback();
        window.removeEventListener('dv-namespace-files-viewer-zoom-in', this._zoomInListener);
        window.removeEventListener('dv-namespace-files-viewer-zoom-out', this._zoomOutListener);
        window.removeEventListener('dv-namespace-files-viewer-rotate-left', this._rotateLeftListener);
        window.removeEventListener('dv-namespace-files-viewer-rotate-right', this._rotateRightListener);
    }
    _loadImage(src)
    {
        this.$.img.src = src;
    }
    _getImageDimension()
    {
        const parentWidth = this.parentNode.offsetWidth;
        const parentHeight = this.parentNode.offsetHeight;
        const imgWidth = this.$.img.naturalWidth;
        const imgHeight = this.$.img.naturalHeight;

        if (parentWidth < imgWidth && parentHeight > imgHeight) {
            this._width = 0.8 * parentWidth;
            this._height = (this._width * imgHeight)/imgWidth;
        } else if ((parentWidth > imgWidth || parentWidth < imgWidth) && parentHeight < imgHeight) {
            this._height = 0.8 * parentHeight;
            this._width = (this._height * imgWidth)/imgHeight;
        } else {
            this._width = imgWidth;
            this._height = imgHeight;
        }
        this.$.img.classList.remove('none');
        this.dispatchEvent(
            new CustomEvent('dv-namespace-files-viewer-finished-loading', {bubbles:true, composed:true})
        );
    }
    _zoomIn()
    {
        this._width *= 1.2;
        this._height *= 1.2;
    }
    _zoomOut()
    {
        this._width /= 1.2;
        this._height /= 1.2;
    }
    _rotateLeft()
    {
        this._rotate = (this._rotate - 90) % 360;
        this.$.img.style.transform = `rotate(${this._rotate}deg)`;
    }
    _rotateRight()
    {
        this._rotate = (this._rotate + 90) % 360;
        this.$.img.style.transform = `rotate(${this._rotate}deg)`;
    }
}
window.customElements.define(ImageViewer.is, ImageViewer);