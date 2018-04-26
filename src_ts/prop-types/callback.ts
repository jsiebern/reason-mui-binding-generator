import * as Console from './../helpers/console';
import Base from './base';

enum CallbackTypes {
    ClipboardCallback = 'ReactEventRe.Clipboard.t',
    CompositionCallback = 'ReactEventRe.Composition.t',
    KeyboardCallback = 'ReactEventRe.Keyboard.t',
    FocusCallback = 'ReactEventRe.Focus.t',
    FormCallback = 'ReactEventRe.Form.t',
    MouseCallback = 'ReactEventRe.Mouse.t',
    SelectionCallback = 'ReactEventRe.Selection.t',
    TouchCallback = 'ReactEventRe.Touch.t',
    UICallback = 'ReactEventRe.UI.t',
    WheelCallback = 'ReactEventRe.Wheel.t',
    MediaCallback = 'ReactEventRe.Media.t',
    ImageCallback = 'ReactEventRe.Image.t',
    AnimationCallback = 'ReactEventRe.Animation.t',
    TransitionCallback = 'ReactEventRe.Transition.t',
    GenericCallback = 'ReactEventRe.Synthetic.t',
    EmptyCallback = '\'emptyCallback',
};

const getCallbackType = (propName: string) => {
    switch (propName) {
        /* Clipboard events */
        case 'onCopy':
        case 'onCut':
        case 'onPaste':
            return CallbackTypes.ClipboardCallback;
        /* Composition events */
        case 'onCompositionEnd':
        case 'onCompositionStart':
        case 'onCompositionUpdate':
            return CallbackTypes.CompositionCallback;
        /* Keyboard events */
        case 'onKeyDown':
        case 'onKeyPress':
        case 'onKeyUp':
            return CallbackTypes.KeyboardCallback;
        /* Focus events */
        case 'onFocus':
        case 'onBlur':
            return CallbackTypes.FocusCallback;
        /* Form events */
        case 'onChange':
        case 'onInput':
        case 'onSubmit':
            return CallbackTypes.FormCallback;
        /* Mouse events */
        case 'onClick':
        case 'onContextMenu':
        case 'onDoubleClick':
        case 'onDrag':
        case 'onDragEnd':
        case 'onDragEnter':
        case 'onDragExit':
        case 'onDragLeave':
        case 'onDragOver':
        case 'onDragStart':
        case 'onDrop':
        case 'onMouseDown':
        case 'onMouseEnter':
        case 'onMouseLeave':
        case 'onMouseMove':
        case 'onMouseOut':
        case 'onMouseOver':
        case 'onMouseUp':
            return CallbackTypes.MouseCallback;
        /* Selection events */
        case 'onSelect':
            return CallbackTypes.SelectionCallback;
        /* Touch events */
        case 'onTouchCancel':
        case 'onTouchEnd':
        case 'onTouchMove':
        case 'onTouchStart':
            return CallbackTypes.TouchCallback;
        /* UI events */
        case 'onScroll':
            return CallbackTypes.UICallback;
        /* Wheel events */
        case 'onWheel':
            return CallbackTypes.WheelCallback;
        /* Media events */
        case 'onAbort':
        case 'onCanPlay':
        case 'onCanPlayThrough':
        case 'onDurationChange':
        case 'onEmptied':
        case 'onEncrypetd':
        case 'onEnded':
        case 'onError':
        case 'onLoadedData':
        case 'onLoadedMetadata':
        case 'onLoadStart':
        case 'onPause':
        case 'onPlay':
        case 'onPlaying':
        case 'onProgress':
        case 'onRateChange':
        case 'onSeeked':
        case 'onSeeking':
        case 'onStalled':
        case 'onSuspend':
        case 'onTimeUpdate':
        case 'onVolumeChange':
        case 'onWaiting':
            return CallbackTypes.MediaCallback;
        /* Image events */
        case 'onLoad':
            return CallbackTypes.ImageCallback;
        /* Animation events */
        case 'onAnimationStart':
        case 'onAnimationEnd':
        case 'onAnimationIteration':
            return CallbackTypes.AnimationCallback;
        /* Transition events */
        case 'onTransitionEnd':
            return CallbackTypes.TransitionCallback;
        /* Material UI Specific */
        case 'onBackdropClick':
        case 'onClickAway':
            return CallbackTypes.MouseCallback;
        case 'onEscapeKeyUp':
        case 'onEscapeKeyDown':
            return CallbackTypes.KeyboardCallback;
        case 'onKeyboardFocus':
            return CallbackTypes.FocusCallback;
        case 'onClose':
        case 'onEnter':
        case 'onEntered':
        case 'onEntering':
        case 'onExit':
        case 'onExited':
        case 'onExiting':
        case 'onClean':
        case 'onDirty':
        case 'onRendered':
        case 'onOpen':
        case 'onDelete':
            return `${CallbackTypes.EmptyCallback}_${Math.random().toString(36).substr(2, 1)}`;
        case 'onChangePage':
            return '(ReactEventRe.Mouse.t, int) => unit';
        case 'onChangeRowsPerPage':
            return CallbackTypes.FormCallback;
        default:
            Console.warn(`Warning: Unhandled callback type ${Console.colors.red}${propName}${Console.colors.yellow} in Callback.getCallbackType ${Console.colors.red}`);
            return CallbackTypes.GenericCallback;

    };
};

class Primitive extends Base {
    isType: PropTypeList = 'Callback'
    propType: PropType$Callback

    constructor(name: string, required: boolean, propType: PropType$Callback) {
        super(name, required, propType);
        this.propType = propType;
        this.parse();
    }

    parse() {
        this.parsed.type = getCallbackType(this.propName);
    }
}

export default Primitive;