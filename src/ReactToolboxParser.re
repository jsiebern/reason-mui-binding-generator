let react_toolbox_base = "react-toolbox/lib/";

let build_index = (json) => {
  let index = Hashtbl.create(8192);
  let rec scan_json = (json) => {
    switch (Yojson.Basic.Util.member("id", json)) {
    | `Null => ()
    | `Int(id) => Hashtbl.replace(index, id, json)
    | _ => assert false
    };
    switch (Yojson.Basic.Util.member("children", json)) {
    | `Null => ()
    | `List(children) => List.iter(scan_json, children)
    | _ => assert false
    }
  };
  scan_json(json);
  index
};

let find_ids = (kind_to_find, index) =>
  Hashtbl.fold(
    (id, json, ids) => {
      open Yojson.Basic.Util;
      let kind = member("kind", json) |> to_int;
      if (kind == kind_to_find) {
        [id, ...ids]
      } else {
        ids
      }
    },
    index,
    []
  );

type component = {
  class_id: int,
  module_id: int,
  props_ids: list(int)
};

let find_components = (index) => {
  let get_property_types = (json) => {
    open Yojson.Basic.Util;
    let react_component_base = "Component";
    let extended_types = [json] |> filter_member("extendedTypes") |> flatten;
    List.fold_left(
      (props_ids, extended_type_json) => {
        let name = member("name", extended_type_json) |> to_string;
        if (name == react_component_base) {
          let first_type_argument =
            try ([extended_type_json] |> filter_member("typeArguments") |> flatten |> List.hd) {
            | Failure(_) =>
              failwith(
                "Cannot find first type argument for " ++ (json |> member("name") |> to_string)
              )
            };
          switch (first_type_argument |> member("type") |> to_string) {
          | "reference" => [first_type_argument |> member("id") |> to_int, ...props_ids]
          | "intersection" =>
            let ids =
              [first_type_argument]
              |> filter_member("types")
              |> flatten
              |> filter_member("id")
              |> flatten
              |> filter_int;
            ids @ props_ids
          | s =>
            failwith(
              "Unexpected first type argument "
              ++ (s ++ (" for " ++ (json |> member("name") |> to_string)))
            )
          }
        } else {
          props_ids
        }
      },
      [],
      extended_types
    )
  };
  let find_module_ids = {
    let module_kind = 1;
    find_ids(module_kind)
  };
  let module_ids = find_module_ids(index);
  let get_module = (class_id) => {
    let module_id =
      List.fold_left(
        (module_id, id) => {
          let json = Hashtbl.find(index, id);
          open Yojson.Basic.Util;
          let groups =
            [json]
            |> filter_member("groups")
            |> flatten
            |> filter_member("children")
            |> flatten
            |> filter_int;
          if (module_id == None && List.mem(class_id, groups)) {
            Some(id)
          } else {
            module_id
          }
        },
        None,
        module_ids
      );
    switch module_id {
    | Some(id) => id
    | None => assert false
    }
  };
  let find_class_ids = {
    let class_kind = 128;
    find_ids(class_kind)
  };
  let class_ids = find_class_ids(index);
  List.fold_left(
    (components, id) => {
      let json = Hashtbl.find(index, id);
      switch (get_property_types(json)) {
      | [] => components
      | props_ids =>
        let module_id = get_module(id);
        [{class_id: id, module_id, props_ids}, ...components]
      }
    },
    [],
    class_ids
  )
};

let custom_callbacks = {
  let table = Hashtbl.create(16);
  let add = Hashtbl.add(table);
  let unit_callback = Component.Type.CustomCallback("ReasonReact.Callback.t(unit)");
  /* React-toolbox events */
  add(("onLeftIconClick", "AppBar"), Component.Type.MouseCallback);
  add(("onRightIconClick", "AppBar"), Component.Type.MouseCallback);
  add(("onHide", "Menu"), unit_callback);
  add(("onHide", "IconMenu"), unit_callback);
  add(("onShow", "Menu"), unit_callback);
  add(("onShow", "IconMenu"), unit_callback);
  add(("onEscKeyDown", "DatePicker"), Component.Type.KeyboardCallback);
  add(("onEscKeyDown", "DatePickerDialog"), Component.Type.KeyboardCallback);
  add(("onEscKeyDown", "Dialog"), Component.Type.KeyboardCallback);
  add(("onEscKeyDown", "Drawer"), Component.Type.KeyboardCallback);
  add(("onEscKeyDown", "Overlay"), Component.Type.KeyboardCallback);
  add(("onEscKeyDown", "TimePicker"), Component.Type.KeyboardCallback);
  add(("onEscKeyDown", "TimePickerDialog"), Component.Type.KeyboardCallback);
  add(("onTimeout", "Snackbar"), unit_callback);
  add(("onDismiss", "DatePicker"), Component.Type.MouseCallback);
  add(("onDismiss", "DatePickerDialog"), Component.Type.MouseCallback);
  add(("onDismiss", "TimePicker"), Component.Type.MouseCallback);
  add(("onDismiss", "TimePickerDialog"), Component.Type.MouseCallback);
  add(("onOverlayClick", "DatePicker"), Component.Type.MouseCallback);
  add(("onOverlayClick", "DatePickerDialog"), Component.Type.MouseCallback);
  add(("onOverlayClick", "Dialog"), Component.Type.MouseCallback);
  add(("onOverlayClick", "Drawer"), Component.Type.MouseCallback);
  add(("onOverlayClick", "NavDrawer"), Component.Type.MouseCallback);
  add(("onOverlayClick", "Sidebar"), Component.Type.MouseCallback);
  add(("onOverlayClick", "TimePicker"), Component.Type.MouseCallback);
  add(("onOverlayClick", "TimePickerDialog"), Component.Type.MouseCallback);
  add(("onDeleteClick", "Autocomplete"), Component.Type.MouseCallback);
  add(("onDeleteClick", "Chip"), Component.Type.MouseCallback);
  add(
    ("onQueryChange", "Autocomplete"),
    Component.Type.CustomCallback("ReasonReact.Callback.t(string)")
  );
  add(
    ("onRowSelect", "Table"),
    Component.Type.CustomCallback("ReasonReact.Callback.t(array(float))")
  );
  add(("onActive", "Tab"), unit_callback);
  add(("onDragStop", "Slider"), unit_callback);
  add(("onOverlayMouseDown", "Dialog"), Component.Type.MouseCallback);
  add(("onOverlayMouseMove", "Dialog"), Component.Type.MouseCallback);
  add(("onOverlayMouseUp", "Dialog"), Component.Type.MouseCallback);
  add(
    ("onSelect", "DatePickerDialog"),
    Component.Type.CustomCallback("Js.Date.t => ReactEventRe.Mouse.t => unit")
  );
  add(("onSelect", "Menu"), Component.Type.CustomCallback("ReasonReact.Callback.t('value)"));
  add(
    ("onSelect", "TableHead"),
    Component.Type.CustomCallback("Js.boolean => ReactEventRe.Mouse.t => unit")
  );
  add(("onSelect", "TableRow"), Component.Type.CustomCallback("float => Js.boolean => unit"));
  add(
    ("onSelect", "TimePickerDialog"),
    Component.Type.CustomCallback("Js.Date.t => ReactEventRe.Mouse.t => unit")
  );
  add(
    ("onBlur", "Autocomplete"),
    Component.Type.CustomCallback("ReactEventRe.Focus.t => string => unit")
  );
  add(
    ("onChange", "Autocomplete"),
    Component.Type.CustomCallback("'value => ReactEventRe.Mouse.t => unit")
  );
  add(
    ("onChange", "Checkbox"),
    Component.Type.CustomCallback("Js.boolean => ReactEventRe.Mouse.t => unit")
  );
  add(("onChange", "ClockHours"), Component.Type.CustomCallback("ReasonReact.Callback.t(float)"));
  add(("onChange", "Clock"), Component.Type.CustomCallback("ReasonReact.Callback.t(Js.Date.t)"));
  add(
    ("onChange", "TimePicker"),
    Component.Type.CustomCallback("Js.Date.t => ReactEventRe.Mouse.t => unit")
  );
  add(
    ("onChange", "ClockMinutes"),
    Component.Type.CustomCallback("ReasonReact.Callback.t(float)")
  );
  add(
    ("onChange", "Dropdown"),
    Component.Type.CustomCallback("'value => ReactEventRe.Mouse.t => unit")
  );
  add(("onClick", "CalendarDay"), Component.Type.CustomCallback("ReasonReact.Callback.t(float)"));
  add(
    ("onChange", "DatePicker"),
    Component.Type.CustomCallback("Js.Date.t => ReactEventRe.Mouse.t => unit")
  );
  add(("onChange", "Calendar"), Component.Type.CustomCallback("Js.Date.t => Js.boolean => unit"));
  add(
    ("onChange", "Slider"),
    Component.Type.CustomCallback("float => ReactEventRe.Focus.t => unit")
  );
  add(
    ("onChange", "Switch"),
    Component.Type.CustomCallback("Js.boolean => ReactEventRe.Mouse.t => unit")
  );
  add(("onChange", "RadioGroup"), Component.Type.CustomCallback("ReasonReact.Callback.t(string)"));
  add(("onChange", "Tabs"), Component.Type.CustomCallback("ReasonReact.Callback.t(float)"));
  add(
    ("onChange", "Input"),
    Component.Type.CustomCallback("string => ReactEventRe.Mouse.t => unit")
  );
  add(("onClick", "Tab"), Component.Type.CustomCallback("ReactEventRe.Mouse.t => float => unit"));
  add(
    ("onClick", "TableCell"),
    Component.Type.CustomCallback("ReactEventRe.Mouse.t => float => float => unit")
  );
  add(
    ("onDayClick", "CalendarMonth"),
    Component.Type.CustomCallback("ReasonReact.Callback.t(float)")
  );
  add(("onMove", "ClockHand"), Component.Type.CustomCallback("float => float => unit"));
  table
};

let get_callback_type = (prop_name, module_name) =>
  try (Hashtbl.find(custom_callbacks, (prop_name, module_name))) {
  | Not_found =>
    try (Component.Property.get_callback_type(prop_name)) {
    | Failure(message) => failwith(message ++ (" in module " ++ module_name))
    }
  };

let build_properties = (module_name, props_json) => {
  let property_kind = 1024;
  open Yojson.Basic.Util;
  let properties = [props_json] |> filter_member("children") |> flatten;
  List.fold_left(
    (props, prop_json) => {
      let name = prop_json |> member("name") |> to_string;
      if (prop_json
          |> member("kind")
          |> to_int == property_kind
          && ! List.mem(name, Component.Property.props_blacklist)) {
        let comment_json = [prop_json] |> filter_member("comment");
        let short_text = comment_json |> filter_member("shortText") |> filter_string;
        let text = comment_json |> filter_member("text") |> filter_string;
        let comment = String.concat("", [String.concat("", short_text), String.concat("", text)]);
        let type_category = prop_json |> member("type") |> member("type") |> to_string;
        let is_optional =
          try (prop_json |> member("flags") |> member("isOptional") |> to_bool) {
          | Type_error(_) => false
          };
        let property_type =
          if (type_category == "union") {
            let union_types_json =
              [prop_json] |> filter_member("type") |> filter_member("types") |> flatten;
            let (has_string_literal, has_other_type) = {
              let xs = union_types_json |> filter_member("type") |> filter_string;
              (
                List.length(xs) > 0 && List.exists((x) => x == "stringLiteral", xs),
                List.length(xs) > 0 && List.exists((x) => x != "stringLiteral", xs)
              )
            };
            let enum_type = {
              let union_values = union_types_json |> filter_member("value") |> filter_string;
              Component.Type.Enum({
                Component.Type.name: String.capitalize_ascii(name),
                values: union_values
              })
            };
            let mapped_types =
              union_types_json
              |> List.filter((union_type_json) => union_type_json |> member("name") != `Null)
              |> List.map(
                   (union_type_json) => {
                     let type_category = union_type_json |> member("type") |> to_string;
                     let type_name = union_type_json |> member("name") |> to_string;
                     Component.Type.map_type(type_category, type_name, false)
                   }
                 );
            let union_type =
              switch (has_string_literal, has_other_type) {
              | (true, false) => enum_type
              | (false, true) => Component.Type.Union(mapped_types)
              | (true, true) => Component.Type.Union([enum_type, ...mapped_types])
              | (false, false) => Component.Type.map_type("intrinsic", "any", false)
              };
            if (is_optional) {
              Component.Type.Option(union_type)
            } else {
              union_type
            }
          } else if (type_category == "intersection") {
            Component.Type.map_type("intrinsic", "any", is_optional)
          } else if (type_category == "array") {
            let element_type_json = prop_json |> member("type") |> member("elementType");
            let type_category = element_type_json |> member("type") |> to_string;
            let type_name = element_type_json |> member("name") |> to_string;
            let element_type = Component.Type.map_type(type_category, type_name, false);
            let array_type = Component.Type.Array(element_type);
            if (is_optional) {
              Component.Type.Option(array_type)
            } else {
              array_type
            }
          } else {
            let type_name = prop_json |> member("type") |> member("name") |> to_string;
            if (Component.Type.is_callback(type_category, type_name, name)) {
              let callback_type = get_callback_type(name, module_name);
              if (is_optional) {
                Component.Type.Option(callback_type)
              } else {
                callback_type
              }
            } else {
              Component.Type.map_type(type_category, type_name, is_optional)
            }
          };
        [{Component.Property.name, property_type, comment}, ...props]
      } else {
        props
      }
    },
    [],
    properties
  )
};

let parse = (path) => {
  let json = Yojson.Basic.from_file(path);
  let index = build_index(json);
  let components = find_components(index);
  let clean_module_path = (module_name) => {
    let quote_index =
      try (String.index(module_name, '"') + 1) {
      | Not_found => 1
      };
    let dot_index =
      try (String.rindex(module_name, '.')) {
      | Not_found => String.length(module_name)
      };
    String.sub(module_name, quote_index, dot_index - quote_index)
  };
  let parsed_components =
    List.map(
      (component) => {
        let class_json = Hashtbl.find(index, component.class_id);
        let module_json = Hashtbl.find(index, component.module_id);
        let props_json = List.map(Hashtbl.find(index), component.props_ids);
        open Yojson.Basic.Util;
        let module_name = class_json |> member("name") |> to_string;
        let module_path = module_json |> member("name") |> to_string |> clean_module_path;
        let properties =
          props_json
          |> List.map(build_properties(module_name))
          |> List.concat
          |> List.sort(compare);
        {Component.name: module_name, module_path: react_toolbox_base ++ module_path, properties}
      },
      components
    );
  List.sort((x, y) => compare(x.Component.name, y.Component.name), parsed_components)
};
