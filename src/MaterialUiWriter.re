let has_theme_property = (properties) =>
  List.exists((p) => p.Component.Property.name == "theme", properties);

let clean_parameter_name = (name) => {
  let first = String.sub(name, 0, 1);
  let name = first == String.uppercase(first) ? String.lowercase(first) ++ name : name;
  let keywords = ["type", "to", "open", "in"];
  if (List.mem(name, keywords)) {
    name ++ "_"
  } else {
    name
  }
};

let clean_variant_value = (value) => {
  let replace = (s) => {
    let invalid_char_regex = Str.regexp("-");
    Str.global_replace(invalid_char_regex, "_", s)
  };
  let clean_value = replace(value);
  let starts_with_letter_regex = Str.regexp("^[A-Za-z]");
  if (! Str.string_match(starts_with_letter_regex, value, 0)) {
    "V_" ++ clean_value
  } else {
    String.capitalize(clean_value)
  }
};

let build_enum_type_declaration = (values) =>
  values |> List.map(clean_variant_value) |> String.concat(" | ");

let get_enums = (properties) =>
  properties
  |> List.map(
       (x) => {
         let ts =
           switch x.Component.Property.property_type {
           | Option(Union(ts)) => ts
           | Option(t)
           | Array(t) => [t]
           | Union(ts) => ts
           | _ as t => [t]
           };
         List.filter(Component.Type.is_enum, ts)
       }
     )
  |> List.concat;

let write_enum_implementations = (oc, properties) => {
  let build_to_string = (values) =>
    values
    |> List.map((x) => Printf.sprintf("%s => \"%s\"", clean_variant_value(x), x))
    |> String.concat(" | ");
  let enums = get_enums(properties);
  List.iter(
    fun
    | Component.Type.Enum({name, values}) =>
      Printf.fprintf(
        oc,
        "module %s = { type t = | %s; let to_string = fun | %s; };\n",
        name,
        build_enum_type_declaration(values),
        build_to_string(values)
      )
    | _ => assert false,
    enums
  )
};

let getClasses = (properties) =>
  properties
  |> List.map(
       (x) => {
         let ts =
           switch x.Component.Property.property_type {
           | Option(Union(ts)) => ts
           | Option(t)
           | Array(t) => [t]
           | Union(ts) => ts
           | _ as t => [t]
           };
         List.filter(Component.Type.is_classes, ts)
       }
     )
  |> List.concat;

let writeClassesImplementations = (oc, properties: list(Component.Property.t)) => {
  let build_to_string = (values) =>
    values
    |> List.map((x) => Printf.sprintf("%s(_) => \"%s\"", clean_variant_value(x), x))
    |> String.concat(" | ");
  let build_to_stringClassName = (values) =>
    values
    |> List.map((x) => Printf.sprintf("%s (className)", clean_variant_value(x)))
    |> String.concat(" | ");
  let classes = getClasses(properties);
  classes
  |> List.iter(
       fun
       | Component.Type.Classes(values) => {
           let classesTypeDef =
             values
             |> List.fold_left(
                  (str, name) => str ++ "| " ++ clean_variant_value(name) ++ "(string) ",
                  ""
                );
           Printf.fprintf(
             oc,
             "module Classes = { type classesType = %s; type t = list(classesType); let to_string = fun | %s; let to_obj = (listOfClasses) => listOfClasses |> StdLabels.List.fold_left(~f=(obj, classType) => { switch classType { | %s => Js.Dict.set(obj, to_string(classType), className) }; obj }, ~init=Js.Dict.empty()); };\n",
             classesTypeDef,
             build_to_string(values),
             build_to_stringClassName(values)
           )
         }
       | _ => assert false
     )
};

let build_props_arg = (properties) => {
  let any_counter = ref(0);
  let prop_to_string = (property) => {
    let name = clean_parameter_name(property.Component.Property.name);
    let type_string =
      Component.Type.to_string(any_counter, property.Component.Property.property_type);
    let optional_prop_string =
      if (Component.Type.is_option(property.Component.Property.property_type)) {
        "=?"
      } else {
        ""
      };
    Printf.sprintf("~%s: %s%s", clean_parameter_name(name), type_string, optional_prop_string)
  };
  let prop_strings = List.map(prop_to_string, properties);
  String.concat(", ", prop_strings)
};

let build_js_props = (properties) => {
  let prop_to_string = (property) => {
    let rec convert = (property_type, property_name, fromOptionMap) => {
      let property_name = clean_parameter_name(property_name);
      Component.Type.(
        switch property_type {
        | Bool when fromOptionMap => "Js.Boolean.to_js_boolean, " ++ property_name
        | Bool when ! fromOptionMap => "Js.Boolean.to_js_boolean(" ++ property_name ++ ")"
        | Date
        | String
        | Number
        | Object
        | Element
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
        | CustomCallback(_)
        | Any => property_name
        | Enum({name, _}) when ! fromOptionMap =>
          Printf.sprintf("%s.to_string(%s)", name, property_name)
        | Classes(_) when ! fromOptionMap => Printf.sprintf("Classes.to_obj(%s)", property_name)
        | Enum({name, _}) when fromOptionMap =>
          Printf.sprintf("%s.to_string, %s", name, property_name)
        | Classes(_) when fromOptionMap => Printf.sprintf("Classes.to_obj, %s", property_name)
        | Array(Bool as t) =>
          Printf.sprintf("Array.map((x) => %s), %s", convert(t, "x", true), property_name)
        | Array(_) => property_name
        | Union(ts) when List.exists(Component.Type.is_enum, ts) && fromOptionMap =>
          let enum =
            ts
            |> List.filter(Component.Type.is_enum)
            |> List.map(
                 fun
                 | Enum(e) => e
                 | _ => assert false
               )
            |> List.hd;
          Printf.sprintf(
            "(fun | `Enum(e) => unwrapValue(`String(%s.to_string(e))) | x => unwrapValue(x)),(%s)",
            enum.Component.Type.name,
            property_name
          )
        | Union(ts) when List.exists(Component.Type.is_enum, ts) && ! fromOptionMap =>
          let enum =
            ts
            |> List.filter(Component.Type.is_enum)
            |> List.map(
                 fun
                 | Enum(e) => e
                 | _ => assert false
               )
            |> List.hd;
          Printf.sprintf(
            "(fun | `Enum(e) => unwrapValue(`String(%s.to_string(e))) | x => unwrapValue(x))(%s)",
            enum.Component.Type.name,
            property_name
          )
        | Union(_) when fromOptionMap => "unwrapValue, " ++ property_name
        | Union(_) when ! fromOptionMap => "unwrapValue(" ++ property_name ++ ")"
        | Option(Bool as t)
        | Option(Enum(_) as t)
        | Option(Classes(_) as t)
        | Option(Union(_) as t) =>
          Printf.sprintf("Js.Nullable.from_opt(optionMap(%s))", convert(t, property_name, true))
        | Option(_) => "Js.Nullable.from_opt(" ++ (property_name ++ ")")
        | _ => failwith("prop_to_string: " ++ Component.Type.to_string(ref(0), property_type))
        }
      )
    };
    Printf.sprintf(
      "\"%s\": %s",
      property.Component.Property.name,
      convert(
        property.Component.Property.property_type,
        clean_parameter_name(property.Component.Property.name),
        false
      )
    )
  };
  let prop_strings = List.map(prop_to_string, properties);
  String.concat(", ", prop_strings)
};

let write_component_implementation = (bundled, oc, component) => {
  let module_path = component.Component.module_path;
  let (external_module_path, module_name) =
    if (bundled && has_theme_property(component.Component.properties)) {
      let len = String.length(module_path);
      let last_slash_index =
        try (String.rindex(module_path, '/')) {
        | Not_found => len
        };
      let module_name =
        if (last_slash_index == len) {
          ""
        } else {
          String.sub(module_path, last_slash_index + 1, len - last_slash_index - 1)
        };
      (String.sub(module_path, 0, last_slash_index), module_name)
    } else {
      (module_path, "default")
    };
  Printf.fprintf(oc, "module %s = {\n", component.Component.name);
  write_enum_implementations(oc, component.Component.properties);
  writeClassesImplementations(oc, component.Component.properties);
  Printf.fprintf(
    oc,
    "[@bs.module \"%s\"] external reactClass : ReasonReact.reactClass = \"%s\";\nlet make = (%s, children) => \nReasonReact.wrapJsForReason(~reactClass=reactClass, ~props={%s}, children);\n};\n",
    external_module_path,
    module_name,
    build_props_arg(component.Component.properties),
    build_js_props(component.Component.properties)
  )
};

let writeColors = (oc, colors: list(MaterialUiParser.color)) => {
  Printf.fprintf(oc, "module Colors = {");
  colors
  |> List.iter(
       (color: MaterialUiParser.color) => {
         let extName = color.key ++ "Ext";
         Printf.fprintf(
           oc,
           "module %s = { [@bs.module \"material-ui/colors/%s\"] external %s: Js.Dict.t(string) = \"default\";",
           String.capitalize(color.key),
           color.key,
           extName
         );
         color.subkeys
         |> List.iter(
              (subkey) => {
                let isInt =
                  try (int_of_string(subkey) != (-1)) {
                  | Failure(_) => false
                  };
                let nKey = isInt ? "c" ++ subkey : subkey;
                Printf.fprintf(
                  oc,
                  "let %s: string = Js.Dict.unsafeGet(%s, \"%s\");",
                  String.uncapitalize(nKey),
                  extName,
                  subkey
                )
              }
            );
         Printf.fprintf(oc, "};")
       }
     );
  Printf.fprintf(oc, "};")
};

let write_re = (~bundled=false, path, component_list, colors) => {
  let oc = open_out(path);
  Printf.fprintf(
    oc,
    "type jsUnsafe;\nexternal toJsUnsafe : 'a => jsUnsafe = \"%%identity\";\nlet unwrapValue = fun | `String(s) => toJsUnsafe(s) | `Bool(b) => toJsUnsafe(Js.Boolean.to_js_boolean(b)) | `Float(f) => toJsUnsafe(f) | `Date(d) => toJsUnsafe(d) | `Callback(c) => toJsUnsafe(c) | `Element(e) => toJsUnsafe(e) | `Object(o) => toJsUnsafe(o) | `Enum(_) => assert false;\nlet optionMap = (fn, option) => switch option { | Some((value)) => Some(fn(value)) | None => None };\n\n"
  );
  Printf.fprintf(
    oc,
    "module WithStyles = {let component = ReasonReact.statelessComponent(\"WithStyles\");let make = (~render, ~classes: Js.t({..}), _children) => {...component,render: (_self) => render(classes)};type withStylesComponent('a) = [@bs] ('a => ReasonReact.reactClass);[@bs.module \"material-ui/styles\"]external withStylesExt : 'styles => withStylesComponent('component) =\"withStyles\";let creteStylesWrapper = (styles: Js.t({..})) => withStylesExt(styles);let make = (~styles=Js.Obj.empty(), ~render, children) =>ReasonReact.wrapJsForReason(~reactClass={let wrapper = creteStylesWrapper(styles);[@bs]wrapper(ReasonReact.wrapReasonForJs(~component,(jsProps) => make(~render=jsProps##render, ~classes=jsProps##classes, [||])))},~props={\"render\": render},children);};\n\n"
  );
  writeColors(oc, colors);
  List.iter(write_component_implementation(bundled, oc), component_list);
  close_out(oc)
};

let build_props_arg_type = (properties) => {
  let any_counter = ref(0);
  let prop_to_string = (property) => {
    let name = property.Component.Property.name;
    let type_string =
      switch property.Component.Property.property_type {
      | Component.Type.Option(t) => Component.Type.to_string(any_counter, t)
      | _ as t => Component.Type.to_string(any_counter, t)
      };
    let optional_prop_string =
      if (Component.Type.is_option(property.Component.Property.property_type)) {
        "=?"
      } else {
        ""
      };
    Printf.sprintf("~%s: %s%s", clean_parameter_name(name), type_string, optional_prop_string)
  };
  let prop_strings = List.map(prop_to_string, properties);
  String.concat(", ", prop_strings)
};

let write_enum_signatures = (oc, properties) => {
  let enums = get_enums(properties);
  List.iter(
    fun
    | Component.Type.Enum({name, values}) =>
      Printf.fprintf(
        oc,
        "module %s : { type t = | %s; let to_string: t => string; };\n",
        name,
        build_enum_type_declaration(values)
      )
    | _ => assert false,
    enums
  )
};

let writeClassesSignatures = (oc, properties: list(Component.Property.t)) => {
  let classes = getClasses(properties);
  classes
  |> List.iter(
       fun
       | Component.Type.Classes(values) => {
           let classesTypeDef =
             values
             |> List.fold_left(
                  (str, name) => str ++ "| " ++ clean_variant_value(name) ++ "(string) ",
                  ""
                );
           Printf.fprintf(
             oc,
             "module Classes : { type classesType = %s; type t = list(classesType); let to_string: classesType => string; let to_obj: t => Js.Dict.t(string); };\n",
             classesTypeDef
           )
         }
       | _ => assert false
     )
};

let build_comment = (properties) => {
  let comments =
    properties
    |> List.filter((c) => c.Component.Property.comment != "")
    |> List.map(
         (c) =>
           Printf.sprintf("@param %s %s", c.Component.Property.name, c.Component.Property.comment)
       );
  String.concat("\n", comments)
};

let write_component_signature = (oc, component) => {
  Printf.fprintf(oc, "module %s: {\n", component.Component.name);
  write_enum_signatures(oc, component.Component.properties);
  writeClassesSignatures(oc, component.Component.properties);
  Printf.fprintf(
    oc,
    "/*** Component %s\n%s */\n",
    component.Component.name,
    build_comment(component.Component.properties)
  );
  Printf.fprintf(
    oc,
    "let make:(%s, array(ReasonReact.reactElement)) => ReasonReact.component(ReasonReact.stateless, ReasonReact.noRetainedProps, ReasonReact.actionless);\n};\n",
    build_props_arg_type(component.Component.properties)
  )
};

let writeColors_rei = (oc, colors: list(MaterialUiParser.color)) => {
  Printf.fprintf(oc, "module Colors: {");
  colors
  |> List.iter(
       (color: MaterialUiParser.color) => {
         Printf.fprintf(oc, "module %s: {", String.capitalize(color.key));
         color.subkeys
         |> List.iter(
              (subkey) => {
                let isInt =
                  try (int_of_string(subkey) != (-1)) {
                  | Failure(_) => false
                  };
                let nKey = isInt ? "c" ++ subkey : subkey;
                Printf.fprintf(oc, "let %s: string;", String.uncapitalize(nKey))
              }
            );
         Printf.fprintf(oc, "};")
       }
     );
  Printf.fprintf(oc, "};")
};

let write_rei = (~bundled=false, path, component_list, colors) => {
  let oc = open_out(path);
  Printf.fprintf(
    oc,
    "module WithStyles: {let make: (~styles: Js.t({..  })=?, ~render: 'a, array(ReasonReact.reactElement)) =>ReasonReact.component(ReasonReact.stateless,  ReasonReact.noRetainedProps,  ReasonReact.actionless);};\n\n"
  );
  writeColors_rei(oc, colors);
  List.iter(write_component_signature(oc), component_list);
  close_out(oc)
};