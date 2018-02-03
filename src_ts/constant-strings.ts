const ConstantStrings = [
  `
external toJsUnsafe : 'a => 'b = "%identity";

let unwrapValue =
  fun
    | \`String(s) => toJsUnsafe(s)
    | \`Bool(b) => toJsUnsafe(Js.Boolean.to_js_boolean(b))
    | \`Float(f) => toJsUnsafe(f)
    | \`Int(i) => toJsUnsafe(i)
    | \`Date(d) => toJsUnsafe(d)
    | \`Callback(c) => toJsUnsafe(c)
    | \`Element(e) => toJsUnsafe(e)
    | \`StringArray(sa) => toJsUnsafe(sa)
    | \`IntArray(ia) => toJsUnsafe(ia)
    | \`FloatArray(fa) => toJsUnsafe(fa)
    | \`ObjectGeneric(og) => toJsUnsafe(og)
    | \`ArrayGeneric(ag) => toJsUnsafe(ag)
    | \`Object(_) => assert false
    | \`Enum(_) => assert false
    | \`EnumArray(_) => assert false;
`,
  `
module MuiTheme = {
  module Direction = {
    type t =
      | Ltr
      | Rtl;
    let toString = (direction: t) =>
      switch direction {
      | Ltr => "ltr"
      | Rtl => "rtl"
      };
    let fromString = (direction: string) =>
      switch direction {
      | "ltr" => Ltr
      | "rtl" => Rtl
      | other => raise(Failure("Unknown direction: " ++ other))
      };
  };
  module Spacing = {
    type t = {unit: int};
  };
  module Transitions = {
    module Easing = {
      [@bs.deriving jsConverter]
      type t = {
        easeInOut: string,
        easeOut: string,
        easeIn: string,
        sharp: string
      };
    };
    module Duration = {
      [@bs.deriving jsConverter]
      type t = {
        shortest: int,
        shorter: int,
        short: int,
        standard: int,
        complex: int,
        enteringScreen: int,
        leavingScreen: int
      };
    };
    [@bs.deriving jsConverter]
    type t = {
      easing: Easing.t,
      duration: Duration.t,
      getAutoHeightDuration: int => int,
      create: (string, {. "duration": int}) => string /* create: (string, {. "duration": int, "easing": string, "delay": int}) => string */
    };
  };
  [@bs.deriving jsConverter]
  type t = {
    direction: Direction.t,
    palette: unit,
    typography: unit,
    mixins: unit,
    breakpoints: unit,
    shadows: list(string),
    transitions: Transitions.t,
    spacing: Spacing.t,
    zIndex: int
  };
  let tFromJs = (theme) => {
    direction: Direction.fromString(theme##direction),
    palette: (),
    typography: (),
    mixins: (),
    breakpoints: (),
    shadows: Js.Array.reduce((lst, entry) => [entry, ...lst], [], theme##shadows),
    transitions: Transitions.tFromJs(theme##transitions),
    spacing: {unit: theme##spacing##unit},
    zIndex: theme##zIndex
  };
};
`,
  `
module WithStyles = {
  type style = {
    name: string,
    styles: ReactDOMRe.Style.t
  };
  let component = ReasonReact.statelessComponent("WithStyles");
  let make = (~render, ~classes: Js.t({..}), _children) => {
    ...component,
    render: (_self) => render(classes)
  };
  type withStylesComponent('a) = [@bs] ('a => ReasonReact.reactClass);
  [@bs.module "material-ui/styles"]
  external withStylesExt : 'styles => withStylesComponent('component) =
    "withStyles";
  let createStylesWrapper = (styles) => withStylesExt(styles);
  let make =
      (
        ~classes: option(list(style))=?,
        ~classesWithTheme: option((MuiTheme.t => list(style)))=?,
        ~render,
        children
      ) =>
    ReasonReact.wrapJsForReason(
      ~reactClass={
        let generateDict = (lst: list(style)) => {
          let classDict: Js.Dict.t(ReactDOMRe.Style.t) = Js.Dict.empty();
          StdLabels.List.iter(~f=(style) => Js.Dict.set(classDict, style.name, style.styles), lst);
          classDict
        };
        let wrapper =
          switch classes {
          | Some(classes) => createStylesWrapper(generateDict(classes))
          | None =>
            switch classesWithTheme {
            | Some(classesWithTheme) =>
              createStylesWrapper(
                toJsUnsafe((theme) => generateDict(classesWithTheme(MuiTheme.tFromJs(theme))))
              )
            | None => createStylesWrapper(generateDict([]))
            }
          };
        [@bs]
        wrapper(
          ReasonReact.wrapReasonForJs(
            ~component,
            (jsProps) => make(~render=jsProps##render, ~classes=jsProps##classes, [||])
          )
        )
      },
      ~props={"render": render},
      children
    );
};
`
];

const constant = ConstantStrings.join('\n');

export default constant;