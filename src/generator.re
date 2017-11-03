let () = {
  let component_list =
    MaterialUiParser.parse("/Users/jonathansiebern/git/reason-mui-binding-generator/output/json");
  MaterialUiWriter.write_re(
    ~bundled=false,
    "/Users/jonathansiebern/git/reason-mui-binding-generator/output/MaterialUi.re",
    component_list
  );
  MaterialUiWriter.write_rei(
    ~bundled=false,
    "/Users/jonathansiebern/git/reason-mui-binding-generator/output/MaterialUi.rei",
    component_list
  );
  MaterialUiWriter.write_re(
    ~bundled=true,
    "/Users/jonathansiebern/git/reason-mui-binding-generator/output/MaterialUiBundled.re",
    component_list
  );
  MaterialUiWriter.write_rei(
    ~bundled=true,
    "/Users/jonathansiebern/git/reason-mui-binding-generator/output/MaterialUiBundled.rei",
    component_list
  )
};
