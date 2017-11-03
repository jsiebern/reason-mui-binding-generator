module Type: {
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
  let is_callback: (string, string) => bool;
  let map_type: (string, bool) => t;
  /* let map_type: (string, string, bool) => t; */
  let to_string: (ref(int), t) => string;
  let is_option: t => bool;
  let is_enum: t => bool;
  let is_any: t => bool;
};

module Property: {
  type t = {
    name: string,
    property_type: Type.t,
    comment: string
  };
  let props_blacklist: list(string);
  let get_callback_type: string => Type.t;
};

type t = {
  name: string,
  module_path: string,
  properties: list(Property.t)
};
