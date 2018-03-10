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
module type WithStylesSafeTemplate = {
  type classRecord;
  type classRecordJs;
  type classRecordStrings;
  type classRecordStringsJs;
  let classRecordToJs: classRecord => classRecordJs;
  let classRecordStringsFromJs: classRecordStringsJs => classRecordStrings;
  let classes: classRecord;
};

module WithStylesSafe = (S: WithStylesSafeTemplate) => {
  [@bs.module] external objectHash : 'a => string = "object-hash";
  /* Component */
  let innerComponent = ReasonReact.statelessComponent("WithStyles");
  let makeStateLessComponent = (~render: ReasonReact.reactElement, _children) => {
    ...innerComponent,
    render: _self => render,
  };
  /* Helper Component for turning the wrapped Component into a Reason Component */
  module Helper = {
    let make = (~render, ~reactClass: ReasonReact.reactClass, children) =>
      ReasonReact.wrapJsForReason(
        ~reactClass,
        ~props={"render": render},
        children,
      );
  };
  /* Imported from MUI */
  type withStylesComponent('a) = (. 'a) => ReasonReact.reactClass;
  [@bs.module "material-ui/styles"]
  external withStylesExt : 'styles => withStylesComponent('component) =
    "withStyles";
  let createStylesWrapper = styles => withStylesExt(styles);
  /* Generating the Wrapper */
  let generateWrapper = () => {
    let wrapper = createStylesWrapper(S.classRecordToJs(S.classes));
    wrapper(.
      ReasonReact.wrapReasonForJs(~component=innerComponent, jsProps =>
        makeStateLessComponent(
          ~render=
            jsProps##render(S.classRecordStringsFromJs(jsProps##classes)),
          [||],
        )
      ),
    );
  };
  /* Reducer Component to cache the wrapper component */
  type state = {
    hash: string,
    wrapper: ReasonReact.reactClass,
  };
  type actions =
    | SetWrapper(ReasonReact.reactClass);
  let component = ReasonReact.reducerComponent("WithStylesSafeCached");
  let make =
      (~render: S.classRecordStrings => ReasonReact.reactElement, children) => {
    ...component,
    initialState: () => {
      hash: objectHash(S.classes),
      wrapper: generateWrapper(),
    },
    reducer: (action, state) =>
      switch (action) {
      | SetWrapper(wrapper) => ReasonReact.Update({...state, wrapper})
      },
    willReceiveProps: ({state}) => {
      let newHash = objectHash(S.classes);
      if (newHash === state.hash) {
        state;
      } else {
        {hash: newHash, wrapper: generateWrapper()};
      };
    },
    render: ({state}) =>
      <Helper render reactClass=state.wrapper> children </Helper>,
  };
};

module WithStyles = {
  [@bs.module] external objectHash : 'a => string = "object-hash";
  type style = {
    name: string,
    styles: ReactDOMRe.Style.t,
  };
  let innerComponent = ReasonReact.statelessComponent("WithStyles");
  let innerMake = (~render, ~classes: Js.t({..}), _children) => {
    ...innerComponent,
    render: _self => render(classes),
  };
  type withStylesComponent('a) = (. 'a) => ReasonReact.reactClass;
  [@bs.module "material-ui/styles"]
  external withStylesExt : 'styles => withStylesComponent('component) =
    "withStyles";
  let createStylesWrapper = styles => withStylesExt(styles);
  /* Helper Component for turning the wrapped Component into a Reason Component */
  module Helper = {
    let make = (~render, ~reactClass: ReasonReact.reactClass, children) =>
      ReasonReact.wrapJsForReason(
        ~reactClass,
        ~props={"render": render},
        children,
      );
  };
  /* Generating the Wrapper */
  let generateWrapper =
      (
        classes: option(list(style)),
        classesWithTheme: option(MuiTheme.t => list(style)),
      ) => {
    let generateDict = (lst: list(style)) => {
      let classDict: Js.Dict.t(ReactDOMRe.Style.t) = Js.Dict.empty();
      StdLabels.List.iter(
        ~f=style => Js.Dict.set(classDict, style.name, style.styles),
        lst,
      );
      classDict;
    };
    let wrapper =
      switch (classes) {
      | Some(classes) => createStylesWrapper(generateDict(classes))
      | None =>
        switch (classesWithTheme) {
        | Some(classesWithTheme) =>
          createStylesWrapper(
            toJsUnsafe(theme =>
              generateDict(classesWithTheme(MuiTheme.tFromJs(theme)))
            ),
          )
        | None => createStylesWrapper(generateDict([]))
        }
      };
    wrapper(.
      ReasonReact.wrapReasonForJs(~component=innerComponent, jsProps =>
        innerMake(~render=jsProps##render, ~classes=jsProps##classes, [||])
      ),
    );
  };
  /* Reducer Component to cache the wrapper component */
  type state = {
    hash: string,
    wrapper: ReasonReact.reactClass,
  };
  type actions =
    | SetWrapper(ReasonReact.reactClass);
  let component = ReasonReact.reducerComponent("WithStylesCached");
  let make =
      (
        ~classes: option(list(style))=?,
        ~classesWithTheme: option(MuiTheme.t => list(style))=?,
        ~render,
        children,
      ) => {
    ...component,
    initialState: () => {
      hash: objectHash(classes) ++ objectHash(classesWithTheme),
      wrapper: generateWrapper(classes, classesWithTheme),
    },
    reducer: (action, state) =>
      switch (action) {
      | SetWrapper(wrapper) => ReasonReact.Update({...state, wrapper})
      },
    willReceiveProps: ({state}) => {
      let newHash = objectHash(classes) ++ objectHash(classesWithTheme);
      if (newHash === state.hash) {
        state;
      } else {
        {hash: newHash, wrapper: generateWrapper(classes, classesWithTheme)};
      };
    },
    render: ({state}) =>
      <Helper render reactClass=state.wrapper> children </Helper>,
  };
};
`
];

const constant = ConstantStrings.join('\n');

export default constant;
