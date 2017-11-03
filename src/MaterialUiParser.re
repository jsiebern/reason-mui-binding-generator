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

let encodeType = (moduleName, propertyName, flowTypeJson) => {
  open Yojson.Basic.Util;
  let name = flowTypeJson |> member("name") |> to_string_option;
  let isOptional =
    try (flowTypeJson |> member("required") |> to_bool) {
    | Type_error(_) => false
    };
  switch name {
  | Some(type_category) =>
    switch type_category {
    | "union" =>
      let union_types_json = flowTypeJson |> member("elements");
      if (union_types_json === `Null) {
        Component.Type.map_type("any", isOptional)
      } else {
        let union_types_json = flowTypeJson |> member("elements") |> to_list;
        let (has_string_literal, has_other_type) = {
          let xs = union_types_json |> filter_member("name") |> filter_string;
          (
            List.length(xs) > 0 && List.exists((x) => x == "literal", xs),
            List.length(xs) > 0 && List.exists((x) => x != "literal", xs)
          )
        };
        let enum_type = {
          let union_values =
            union_types_json
            |> filter_member("value")
            |> filter_string
            |> List.map(
                 (str) =>
                   String.contains_from(str, 0, '\'') ?
                     String.sub(str, 1, String.length(str) - 2) : str
               );
          Component.Type.Enum({
            Component.Type.name: String.capitalize(propertyName),
            values: union_values
          })
        };
        let mapped_types =
          union_types_json
          |> List.filter((union_type_json) => union_type_json |> member("value") != `Null)
          |> List.map(
               (union_type_json) => {
                 let type_category = union_type_json |> member("name") |> to_string;
                 Component.Type.map_type(type_category, false)
               }
             );
        let union_type =
          switch (has_string_literal, has_other_type) {
          | (true, false) => enum_type
          | (false, true) => Component.Type.Union(mapped_types)
          | (true, true) => Component.Type.Union([enum_type, ...mapped_types])
          | (false, false) => Component.Type.Any
          };
        if (isOptional) {
          Component.Type.Option(union_type)
        } else {
          union_type
        }
      }
    | "intersection" => Component.Type.map_type("any", isOptional)
    | "Array" =>
      let element_type_json = flowTypeJson |> member("elements") |> to_list;
      let element_type_json = List.nth(element_type_json, 0);
      let type_name = element_type_json |> member("name") |> to_string;
      let element_type = Component.Type.map_type(type_name, false);
      let array_type = Component.Type.Array(element_type);
      if (isOptional) {
        Component.Type.Option(array_type)
      } else {
        array_type
      }
    | other =>
      /* TODO: signature / type == function check */
      if (Component.Type.is_callback(type_category, propertyName)) {
        let callback_type = get_callback_type(propertyName, moduleName);
        if (isOptional) {
          Component.Type.Option(callback_type)
        } else {
          callback_type
        }
      } else {
        Component.Type.map_type(type_category, isOptional)
      }
    }
  | None => Component.Type.Any
  }
};

let build_properties = (moduleName, props_json) => {
  open Yojson.Basic.Util;
  let properties = props_json |> to_assoc;
  properties
  |> List.fold_left(
       (props, prop) => {
         let (name, propJson) = prop;
         print_endline("--> Prop " ++ name);
         if (! List.mem(name, Component.Property.props_blacklist)) {
           let comment = propJson |> member("description") |> to_string;
           let flowType = propJson |> member("flowType");
           let normalType = propJson |> member("type");
           let typeJson = flowType !== `Null ? flowType : normalType;
           let property_type = encodeType(moduleName, name, typeJson);
           [{Component.Property.name, property_type, comment}, ...props]
         } else {
           props
         }
       },
       []
     )
};

let parseComponent = (filePath) => {
  print_endline("Parsing " ++ filePath);
  open Yojson.Basic.Util;
  let json = Yojson.Basic.from_file(filePath);
  let name = json |> member("name") |> to_string;
  let module_path = json |> member("importPath") |> to_string;
  {Component.name, module_path, properties: build_properties(name, json |> member("props"))}
};

let parse = (path) =>
  Sys.readdir(path)
  |> Array.fold_left(
       (lst, fileName) => {
         let filePath = path ++ "/" ++ fileName;
         if (Str.last_chars(filePath, 5) == ".json") {
           [parseComponent(filePath), ...lst]
         } else {
           lst
         }
       },
       []
     );
