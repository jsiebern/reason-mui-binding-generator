Migrate_parsetree.Driver.register(
  ~name="ppx_withStyles",
  Migrate_parsetree.Versions.ocaml_406,
  (_config, _cookies) =>
  Mapper.withStylesMapper
);

Migrate_parsetree.Driver.run_as_ppx_rewriter();