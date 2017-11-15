
let component_list =
  MaterialUiParser.parse("/Users/jonathansiebern/git/reason-mui-binding-generator/output/json");

let colors = MaterialUiParser.parseColors("/Users/jonathansiebern/git/reason-mui-binding-generator/output/json");

MaterialUiWriter.write_re(
  "/Users/jonathansiebern/git/reason-mui-binding-generator/output/MaterialUi.re",
  component_list,
  colors
);

MaterialUiWriter.write_rei(
  "/Users/jonathansiebern/git/reason-mui-binding-generator/output/MaterialUi.rei",
  component_list,
  colors
);