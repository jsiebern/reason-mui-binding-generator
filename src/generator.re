let component_list = MaterialUiParser.parse("./../../../output/json");

let colors = MaterialUiParser.parseColors("./../../../output/json");

MaterialUiWriter.write_re("./../../../output/MaterialUi.re", component_list, colors);

MaterialUiWriter.write_rei("./../../../output/MaterialUi.rei", component_list, colors);