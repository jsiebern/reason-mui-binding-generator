module Type = {
  type enum = {
    name: string,
    values: list(string)
  };
  type t =
    | Any
    | String
    | Bool
    | Number
    | Date
    | ClipboardCallback
    | CompositionCallback
    | KeyboardCallback
    | FocusCallback
    | FormCallback
    | MouseCallback
    | SelectionCallback
    | TouchCallback
    | UICallback
    | WheelCallback
    | MediaCallback
    | ImageCallback
    | AnimationCallback
    | TransitionCallback
    | GenericCallback
    | CustomCallback(string)
    | Element
    | Style
    | Object
    | Enum(enum)
    | Option(t)
    | Array(t)
    | Union(list(t));
  let is_callback = (type_name, props_name) => {
    let is_name_valid = {
      let regex = Str.regexp("on[A-Z]");
      Str.string_match(regex, props_name, 0)
    };
    switch type_name {
    | "signature" when is_name_valid => true
    | _ => false
    }
  };
  let map_type = (type_name, is_optional) => {
    let t =
      switch type_name {
      | "string"
      | "String" => String
      | "number" => Number
      | "boolean" => Bool
      | "any" => Any
      | "Node"
      | "React.ReactNode" => Element
      | "CSSProperties" => Style
      | "Date" => Date
      | _ => Object
      };
    if (is_optional) {
      Option(t)
    } else {
      t
    }
  };
  let to_polymorphic_variant =
    fun
    | String => "`String"
    | Bool => "`Bool"
    | Number => "`Float"
    | Date => "`Date"
    | ClipboardCallback
    | CompositionCallback
    | KeyboardCallback
    | FocusCallback
    | FormCallback
    | MouseCallback
    | SelectionCallback
    | TouchCallback
    | UICallback
    | WheelCallback
    | MediaCallback
    | ImageCallback
    | AnimationCallback
    | TransitionCallback
    | GenericCallback
    | CustomCallback(_) => "`Callback"
    | Element => "`Element"
    | Style
    | Object
    | Any => "`Object"
    | Enum(_) => "`Enum"
    | Array(_)
    | Option(_)
    | Union(_) => failwith("Unsupported type in union");
  let any_to_string = (counter) => {
    let letter_base = Char.code('a') - 1;
    let number_base = Char.code('0') - 1;
    let char_index = counter mod 26;
    let number_index = counter / 26;
    let character = Char.chr(letter_base + char_index);
    if (number_index == 0) {
      "'" ++ String.make(1, character)
    } else {
      let number = Char.chr(number_base + number_index);
      "'" ++ (String.make(1, character) ++ String.make(1, number))
    }
  };
  let rec to_string = (counter_ref) =>
    fun
    | Any => {
        incr(counter_ref);
        any_to_string(counter_ref^)
      }
    | String => "string"
    | Bool => "bool"
    | Number => "float"
    | Date => "Js.Date.t"
    | ClipboardCallback => "ReasonReact.Callback.t(ReactEventRe.Clipboard.t)"
    | CompositionCallback => "ReasonReact.Callback.t(ReactEventRe.Composition.t)"
    | KeyboardCallback => "ReasonReact.Callback.t(ReactEventRe.Keyboard.t)"
    | FocusCallback => "ReasonReact.Callback.t(ReactEventRe.Focus.t)"
    | FormCallback => "ReasonReact.Callback.t(ReactEventRe.Form.t)"
    | MouseCallback => "ReasonReact.Callback.t(ReactEventRe.Mouse.t)"
    | SelectionCallback => "ReasonReact.Callback.t(ReactEventRe.Selection.t)"
    | TouchCallback => "ReasonReact.Callback.t(ReactEventRe.Touch.t)"
    | UICallback => "ReasonReact.Callback.t(ReactEventRe.UI.t)"
    | WheelCallback => "ReasonReact.Callback.t(ReactEventRe.Wheel.t)"
    | MediaCallback => "ReasonReact.Callback.t(ReactEventRe.Media.t)"
    | ImageCallback => "ReasonReact.Callback.t(ReactEventRe.Image.t)"
    | AnimationCallback => "ReasonReact.Callback.t(ReactEventRe.Animation.t)"
    | TransitionCallback => "ReasonReact.Callback.t(ReactEventRe.Transition.t)"
    | GenericCallback => "ReasonReact.Callback.t(ReactEventRe.Synthetic.t)"
    | CustomCallback(signature) => "(" ++ (signature ++ ")")
    | Element => "ReasonReact.reactElement"
    | Style => "ReactDOMRe.style"
    | Object => "Js.t({..})"
    | Enum({name, _}) => name ++ ".t"
    | Option(t) => "option(" ++ (to_string(counter_ref, t) ++ ")")
    | Array(t) => "array(" ++ (to_string(counter_ref, t) ++ ")")
    | Union(ts) =>
      "[ | "
      ++ (
        String.concat(
          " | ",
          List.map(
            (t) => to_polymorphic_variant(t) ++ ("(" ++ (to_string(counter_ref, t) ++ ")")),
            ts
          )
        )
        ++ "]"
      );
  let is_option =
    fun
    | Option(_) => true
    | _ => false;
  let is_enum =
    fun
    | Enum(_) => true
    | _ => false;
  let is_any =
    fun
    | Any => true
    | _ => false;
};

module Property = {
  type t = {
    name: string,
    property_type: Type.t,
    comment: string
  };
  let props_blacklist = ["key", "children"];
  let standard_callbacks = {
    let table = Hashtbl.create(36);
    let add = Hashtbl.add(table);
    /* Clipboard events */
    add("onCopy", Type.ClipboardCallback);
    add("onCut", Type.ClipboardCallback);
    add("onPaste", Type.ClipboardCallback);
    /* Composition events */
    add("onCompositionEnd", Type.CompositionCallback);
    add("onCompositionStart", Type.CompositionCallback);
    add("onCompositionUpdate", Type.CompositionCallback);
    /* Keyboard events */
    add("onKeyDown", Type.KeyboardCallback);
    add("onKeyPress", Type.KeyboardCallback);
    add("onKeyUp", Type.KeyboardCallback);
    /* Focus events */
    add("onFocus", Type.FocusCallback);
    add("onBlur", Type.FocusCallback);
    /* Form events */
    add("onChange", Type.FormCallback);
    add("onInput", Type.FormCallback);
    add("onSubmit", Type.FormCallback);
    /* Mouse events */
    add("onClick", Type.MouseCallback);
    add("onContextMenu", Type.MouseCallback);
    add("onDoubleClick", Type.MouseCallback);
    add("onDrag", Type.MouseCallback);
    add("onDragEnd", Type.MouseCallback);
    add("onDragEnter", Type.MouseCallback);
    add("onDragExit", Type.MouseCallback);
    add("onDragLeave", Type.MouseCallback);
    add("onDragOver", Type.MouseCallback);
    add("onDragStart", Type.MouseCallback);
    add("onDrop", Type.MouseCallback);
    add("onMouseDown", Type.MouseCallback);
    add("onMouseEnter", Type.MouseCallback);
    add("onMouseLeave", Type.MouseCallback);
    add("onMouseMove", Type.MouseCallback);
    add("onMouseOut", Type.MouseCallback);
    add("onMouseOver", Type.MouseCallback);
    add("onMouseUp", Type.MouseCallback);
    /* Selection events */
    add("onSelect", Type.SelectionCallback);
    /* Touch events */
    add("onTouchCancel", Type.TouchCallback);
    add("onTouchEnd", Type.TouchCallback);
    add("onTouchMove", Type.TouchCallback);
    add("onTouchStart", Type.TouchCallback);
    /* UI events */
    add("onScroll", Type.UICallback);
    /* Wheel events */
    add("onWheel", Type.WheelCallback);
    /* Media events */
    add("onAbort", Type.MediaCallback);
    add("onCanPlay", Type.MediaCallback);
    add("onCanPlayThrough", Type.MediaCallback);
    add("onDurationChange", Type.MediaCallback);
    add("onEmptied", Type.MediaCallback);
    add("onEncrypetd", Type.MediaCallback);
    add("onEnded", Type.MediaCallback);
    add("onError", Type.MediaCallback);
    add("onLoadedData", Type.MediaCallback);
    add("onLoadedMetadata", Type.MediaCallback);
    add("onLoadStart", Type.MediaCallback);
    add("onPause", Type.MediaCallback);
    add("onPlay", Type.MediaCallback);
    add("onPlaying", Type.MediaCallback);
    add("onProgress", Type.MediaCallback);
    add("onRateChange", Type.MediaCallback);
    add("onSeeked", Type.MediaCallback);
    add("onSeeking", Type.MediaCallback);
    add("onStalled", Type.MediaCallback);
    add("onSuspend", Type.MediaCallback);
    add("onTimeUpdate", Type.MediaCallback);
    add("onVolumeChange", Type.MediaCallback);
    add("onWaiting", Type.MediaCallback);
    /* Image events */
    add("onLoad", Type.ImageCallback) /* duplicate */; /*add "onError" Type.ImageCallback;*/
    /* Animation events */
    add("onAnimationStart", Type.AnimationCallback);
    add("onAnimationEnd", Type.AnimationCallback);
    add("onAnimationIteration", Type.AnimationCallback);
    /* Transition events */
    add("onTransitionEnd", Type.TransitionCallback);
    table
  };
  let get_callback_type = (name) =>
    try (Hashtbl.find(standard_callbacks, name)) {
    /* | Not_found => failwith("get_callback_type: " ++ (name ++ " not found")) */
    | Not_found => Type.GenericCallback
    };
};

type t = {
  name: string,
  module_path: string,
  properties: list(Property.t)
};
