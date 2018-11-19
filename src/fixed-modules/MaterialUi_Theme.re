module Shape = {
  [@bs.deriving abstract]
  type t = {borderRadius: int};
};

module Breakpoints = {
  [@bs.deriving jsConverter]
  type breakpoint = [ | `xs | `sm | `md | `lg | `xl];

  [@bs.deriving abstract]
  type t = {
    keys: array(string),
    values: Js.Dict.t(int),
    up: string => string,
    down: string => string,
    between: (string, string) => string,
    only: string => string,
    width: string => string,
  };
};

module Mixins = {
  [@bs.deriving abstract]
  type t = {
    gutters: Js.Dict.t(string) => Js.Dict.t(string),
    toolbar: Js.Dict.t(string),
  };
};

module Color = {
  [@bs.deriving abstract]
  type t = {
    [@bs.as "50"]
    c50: string,
    [@bs.as "100"]
    c100: string,
    [@bs.as "200"]
    c200: string,
    [@bs.as "300"]
    c300: string,
    [@bs.as "400"]
    c400: string,
    [@bs.as "500"]
    c500: string,
    [@bs.as "600"]
    c600: string,
    [@bs.as "700"]
    c700: string,
    [@bs.as "800"]
    c800: string,
    [@bs.as "900"]
    c900: string,
    [@bs.as "A100"]
    a100: string,
    [@bs.as "A200"]
    a200: string,
    [@bs.as "A400"]
    a400: string,
    [@bs.as "A700"]
    a700: string,
  };
};

module Palette = {
  module CommonColors = {
    [@bs.deriving abstract]
    type t = {
      black: string,
      white: string,
    };
  };
  module PaletteColor = {
    [@bs.deriving abstract]
    type t = {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
  };
  module TypeText = {
    [@bs.deriving abstract]
    type t = {
      primary: string,
      secondary: string,
      disabled: string,
      hint: string,
    };
  };
  module TypeAction = {
    [@bs.deriving abstract]
    type t = {
      active: string,
      hover: string,
      hoverOpacity: float,
      selected: string,
      disabled: string,
      disabledBackground: string,
    };
  };
  module TypeBackground = {
    [@bs.deriving abstract]
    type t = {
      default: string,
      paper: string,
    };
  };

  [@bs.deriving abstract]
  type t = {
    common: CommonColors.t,
    [@bs.as "type"]
    type_: string,
    contrastThreshold: float,
    tonalOffset: float,
    primary: PaletteColor.t,
    secondary: PaletteColor.t,
    error: PaletteColor.t,
    grey: Color.t,
    text: TypeText.t,
    divider: string,
    action: TypeAction.t,
    background: TypeBackground.t,
    getContrastText: string => string,
  };
};

module Spacing = {
  [@bs.deriving abstract]
  type t = {
    [@bs.as "unit"]
    unit_: float,
  };
};

module Transitions = {
  module Easing = {
    [@bs.deriving abstract]
    type t = {
      easeInOut: string,
      easeOut: string,
      easeIn: string,
      sharp: string,
    };
  };
  module Duration = {
    [@bs.deriving abstract]
    type t = {
      shortest: float,
      shorter: float,
      short: float,
      standard: float,
      complex: float,
      enteringScreen: float,
      leavingScreen: float,
    };
  };

  module CreateOptions = {
    [@bs.deriving abstract]
    type t = {
      [@bs.optional]
      duration: float,
      [@bs.optional]
      easing: string,
      [@bs.optional]
      delay: float,
    };
  };

  [@bs.deriving abstract]
  type t = {
    easing: Easing.t,
    duration: Duration.t,
    create: (string, CreateOptions.t) => string,
    getAutoHeightDuration: float => float,
  };
};

module Typography = {
  [@bs.deriving jsConverter]
  type themeStyle = [
    | /* DEPRECATED */
      `h1
    | `h2
    | `h3
    | `h4
    | `h5
    | `h6
    | `subtitle1
    | `subtitle2
    | `body1
    | `body2
    | `caption
    | `button
    | `overline
    | `display4
    | `display3
    | `display2
    | `display1
    | `headline
    | `title
    | `subheading
  ];

  module FontStyle = {
    [@bs.deriving abstract]
    type t = {
      fontFamily: string,
      fontSize: float,
      fontWeightLight: int,
      fontWeightRegular: int,
      fontWeightMedium: int,
      letterSpacing: float,
      lineHeight: float,
      textTransform: string,
      color: string,
    };
  };

  type t = Js.Dict.t(FontStyle.t);
};

module ZIndex = {
  [@bs.deriving abstract]
  type t = {
    mobileStepper: int,
    appBar: int,
    drawer: int,
    modal: int,
    snackbar: int,
    tooltip: int,
  };
};

[@bs.deriving abstract]
type t = {
  shape: Shape.t,
  breakpoints: Breakpoints.t,
  direction: string,
  mixins: Mixins.t,
  /* TODO: Generate overrides module */
  /* [@bs.optional]
     overrides: Overrides.t, */
  palette: Palette.t,
  [@bs.optional]
  props: Js.Dict.t(string),
  shadows: array(string),
  spacing: Spacing.t,
  transitions: Transitions.t,
  typography: Typography.t,
  zIndex: ZIndex.t,
};