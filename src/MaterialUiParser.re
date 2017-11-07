let custom_callbacks = {
  let table = Hashtbl.create(16);
  let add = Hashtbl.add(table);
  /* let unit_callback = Component.Type.CustomCallback("ReasonReact.Callback.t(unit)"); */
  /* React-toolbox events */
  add(("onKeyboardFocus", "ButtonBase"), Component.Type.GenericCallback);
  add(("onRequestClose", "Drawer"), Component.Type.GenericCallback);
  add(("onRequestClose", "Tooltip"), Component.Type.GenericCallback);
  add(("onRequestOpen", "Tooltip"), Component.Type.GenericCallback);
  add(("onBackdropClick", "Dialog"), Component.Type.MouseCallback);
  add(("onEscapeKeyUp", "Dialog"), Component.Type.KeyboardCallback);
  add(("onRequestClose", "Dialog"), Component.Type.GenericCallback);
  add(("onRequestClose", "Menu"), Component.Type.GenericCallback);
  add(("onRequestClose", "Popover"), Component.Type.GenericCallback);
  table
};

let get_callback_type = (prop_name, module_name) =>
  try (Hashtbl.find(custom_callbacks, (prop_name, module_name))) {
  | Not_found =>
    try (Component.Property.get_callback_type(prop_name)) {
    | Failure(message) => failwith(message ++ (" in module " ++ module_name))
    }
  };

let rec resolveSignature = (flowTypeJson) => {
  open Yojson.Basic.Util;
  let signatureType = flowTypeJson |> member("type") |> to_string;
  switch signatureType {
  | "function" =>
    let signature = flowTypeJson |> member("signature");
    let argumentList = signature |> member("arguments") |> to_list;
    let returnType = signature |> member("return") |> member("name") |> to_string;
    let returnType =
      switch returnType {
      | "void" => "unit"
      | "Node"
      | "node" => "ReasonReact.reactElement"
      | other => failwith("unknown callback return type: " ++ other)
      };
    let customCallback =
      argumentList
      |> List.fold_left(
           (str, arg) => {
             let argName = arg |> member("name") |> to_string;
             let argType = arg |> member("type") |> member("name") |> to_string;
             let argType =
               switch argType {
               | "Event" => "ReactEventRe.Synthetic.t"
               | "SyntheticEvent" => "ReactEventRe.Synthetic.t"
               | "SyntheticFocusEvent" => "ReactEventRe.Focus.t"
               | "SyntheticUIEvent" => "ReactEventRe.UI.t"
               | "SyntheticInputEvent" => "ReactEventRe.Form.t"
               | "SyntheticKeyboardEvent" => "ReactEventRe.Keyboard.t"
               | "string" => "string"
               | "bool" => "bool"
               | "number" => "float"
               | "union"
               | "any" => "_"
               | "Node"
               | "node" => "ReasonReact.reactElement"
               | "signature" => resolveSignature(arg |> member("type"))
               | other =>
                 failwith("unknown callback argument type: " ++ argName ++ " --> " ++ other)
               };
             str ++ argType ++ " => "
           },
           ""
         );
    customCallback ++ returnType
  | "object" =>
    let properties = flowTypeJson |> member("signature") |> member("properties") |> to_list;
    let types =
      properties
      |> List.fold_left(
           (str, prop) => {
             let key =
               switch (prop |> member("key")) {
               | `String(key) => key
               | _ => "unionProp"
               };
             let valueType = prop |> member("value") |> member("name") |> to_string;
             let valueType =
               switch valueType {
               | "string" => "string"
               | "bool" => "bool"
               | "number" => "float"
               | "union"
               | "any" => "_"
               | "Node"
               | "node" => "ReasonReact.reactElement"
               | other => failwith("unknown object property type: " ++ key ++ " --> " ++ other)
               };
             str ++ "\"" ++ key ++ "\": " ++ valueType ++ ", "
           },
           ""
         );
    "{. " ++ String.sub(types, 0, String.length(types) - 2) ++ " }"
  | _ => "_"
  }
};

let encodeType = (moduleName, propertyName, flowTypeJson, isOptional) => {
  open Yojson.Basic.Util;
  let name = flowTypeJson |> member("name") |> to_string_option;
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
          |> List.filter((union_type_json) => union_type_json |> member("name") != `Null)
          |> List.filter(
               (union_type_json) => union_type_json |> member("name") |> to_string != "literal"
             )
          |> List.map(
               (union_type_json) => {
                 let type_category = union_type_json |> member("name") |> to_string;
                 if (Component.Type.is_signature(type_category)) {
                   let signatureType = union_type_json |> member("type") |> to_string;
                   switch signatureType {
                   | "object" => Component.Type.ObjectSignature(resolveSignature(union_type_json))
                   | "function" => Component.Type.CustomCallback(resolveSignature(union_type_json))
                   | other =>
                     failwith("unknown signature type: " ++ propertyName ++ " --> " ++ other)
                   }
                 } else {
                   Component.Type.map_type(type_category, false)
                 }
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
      if (Component.Type.is_callback(type_category, propertyName)) {
        let callback_type = get_callback_type(propertyName, moduleName);
        if (isOptional) {
          Component.Type.Option(callback_type)
        } else {
          callback_type
        }
      } else if (Component.Type.is_signature(type_category)) {
        let callback_type = Component.Type.CustomCallback(resolveSignature(flowTypeJson));
        if (isOptional) {
          Component.Type.Option(callback_type)
        } else {
          callback_type
        }
      } else if (Component.Type.isCallbackNameValid(propertyName)) {
        let callback_type =
          switch type_category {
          | "TransitionCallback" => Component.Type.TransitionCallback
          | other => failwith("unknown callback type: " ++ propertyName ++ " --> " ++ other)
          };
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
           let isRequired = propJson |> member("required");
           let isRequired = isRequired == `Null ? false : isRequired |> to_bool;
           let isOptional = isRequired ? false : true;
           let property_type = encodeType(moduleName, name, typeJson, isOptional);
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
  let inheritsFrom = json |> member("inheritsFrom") |> to_string;
  {
    Component.name,
    module_path,
    properties: build_properties(name, json |> member("props")),
    inheritsFrom
  }
};

let solveInheritance = (components: list(Component.t), component: Component.t) =>
  switch component.inheritsFrom {
  | ""
  | "CSSTransition"
  | "Transition" => component
  | inheritsFrom =>
    let parent =
      try (components |> List.find((parent) => parent.Component.name == inheritsFrom)) {
      | Not_found =>
        failwith(
          "########################## Could not find parent component: " ++ component.inheritsFrom
        )
      };
    let cleanedProperties =
      parent.properties
      |> List.fold_left(
           (newProperties, property) =>
             if (component.properties
                 |> List.exists(
                      (prop) => prop.Component.Property.name == property.Component.Property.name
                    )) {
               newProperties
             } else {
               [property, ...newProperties]
             },
           []
         );
    {...component, properties: List.append(component.properties, cleanedProperties)}
  };

let parse = (path) => {
  let components =
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
  let solveInheritance = solveInheritance(components);
  components |> List.map((component) => solveInheritance(component))
};
