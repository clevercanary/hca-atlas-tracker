# Changelog

## [1.3.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.2.0...v1.3.0) (2025-01-17)


### Features

* remove cellxgene link to make room in atlas source datasets table ([#542](https://github.com/clevercanary/hca-atlas-tracker/issues/542)) ([#544](https://github.com/clevercanary/hca-atlas-tracker/issues/544)) ([2dbee59](https://github.com/clevercanary/hca-atlas-tracker/commit/2dbee5948ead5e4c9f81dca92b1161101e2b6d18))


### Build System

* checkout latest tag during build ([#523](https://github.com/clevercanary/hca-atlas-tracker/issues/523)) ([#553](https://github.com/clevercanary/hca-atlas-tracker/issues/553)) ([a417b1e](https://github.com/clevercanary/hca-atlas-tracker/commit/a417b1ed2c33f65c05967b6e0f5b6d7e46995048))
* fetch latest tag only during build ([#523](https://github.com/clevercanary/hca-atlas-tracker/issues/523)) ([#554](https://github.com/clevercanary/hca-atlas-tracker/issues/554)) ([7409bb9](https://github.com/clevercanary/hca-atlas-tracker/commit/7409bb96546de12e7fc3dba4533f65b7837e740b))

## [1.2.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.1.0...v1.2.0) (2025-01-14)


### Features

* add additional grouping options for tasks and remove default grouping ([#538](https://github.com/clevercanary/hca-atlas-tracker/issues/538)) ([#541](https://github.com/clevercanary/hca-atlas-tracker/issues/541)) ([7912ca9](https://github.com/clevercanary/hca-atlas-tracker/commit/7912ca9951891b61e13beb64abae22a0c9fbf32e))
* add download buttons to atlas source datasets ([#526](https://github.com/clevercanary/hca-atlas-tracker/issues/526)) ([#535](https://github.com/clevercanary/hca-atlas-tracker/issues/535)) ([12dc308](https://github.com/clevercanary/hca-atlas-tracker/commit/12dc30862e8891114e99e87a8157b992bd9cb17c))
* allow grouping atlases and add grouping to roadmap filter ([#519](https://github.com/clevercanary/hca-atlas-tracker/issues/519)) ([#527](https://github.com/clevercanary/hca-atlas-tracker/issues/527)) ([74fe0cc](https://github.com/clevercanary/hca-atlas-tracker/commit/74fe0cc6fb352d2e4c43b3b88ba42ea566df13c7))
* allow grouping users ([#520](https://github.com/clevercanary/hca-atlas-tracker/issues/520)) ([#528](https://github.com/clevercanary/hca-atlas-tracker/issues/528)) ([c4d8e82](https://github.com/clevercanary/hca-atlas-tracker/commit/c4d8e826c7023924206a4f829676f30f69d06b7f))
* allow setting past target completions ([#534](https://github.com/clevercanary/hca-atlas-tracker/issues/534)) ([#536](https://github.com/clevercanary/hca-atlas-tracker/issues/536)) ([ac39388](https://github.com/clevercanary/hca-atlas-tracker/commit/ac393882f782743913625213ad799ec5eb76e14b))
* link atlas source dataset publication and study and update title label ([#524](https://github.com/clevercanary/hca-atlas-tracker/issues/524)) ([#531](https://github.com/clevercanary/hca-atlas-tracker/issues/531)) ([2b86d22](https://github.com/clevercanary/hca-atlas-tracker/commit/2b86d22a9a60aa62e7578f5b619309e738e467a2))
* relabel source study title column ([#525](https://github.com/clevercanary/hca-atlas-tracker/issues/525)) ([#529](https://github.com/clevercanary/hca-atlas-tracker/issues/529)) ([8367778](https://github.com/clevercanary/hca-atlas-tracker/commit/83677785f79072e1b994411dbca3f4312d00464c))
* show per-system ingestion task counts in atlas list rather than all tasks ([#539](https://github.com/clevercanary/hca-atlas-tracker/issues/539)) ([#543](https://github.com/clevercanary/hca-atlas-tracker/issues/543)) ([b6b2c9e](https://github.com/clevercanary/hca-atlas-tracker/commit/b6b2c9e2485573b973646e0a4bd425646887a72f))
* update atlas roadmap filter to sort by status and name ([#537](https://github.com/clevercanary/hca-atlas-tracker/issues/537)) ([#540](https://github.com/clevercanary/hca-atlas-tracker/issues/540)) ([60ef3fd](https://github.com/clevercanary/hca-atlas-tracker/commit/60ef3fd623d6acc851e45c2f89582003f8c9a97f))


### Tests

* restore user-profile mock to fix tests ([#532](https://github.com/clevercanary/hca-atlas-tracker/issues/532)) ([#533](https://github.com/clevercanary/hca-atlas-tracker/issues/533)) ([923f221](https://github.com/clevercanary/hca-atlas-tracker/commit/923f221854650906b42d1d40099eb68ac83492ae))

## [1.1.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.0.0...v1.1.0) (2025-01-07)


### Features

* add atlas source dataset detail page ([#489](https://github.com/clevercanary/hca-atlas-tracker/issues/489)) ([#504](https://github.com/clevercanary/hca-atlas-tracker/issues/504)) ([d08f22b](https://github.com/clevercanary/hca-atlas-tracker/commit/d08f22b82de3d58c220cacb1474358f531051e90))
* add cellxgene collection id to atlas forms ([#484](https://github.com/clevercanary/hca-atlas-tracker/issues/484)) ([#486](https://github.com/clevercanary/hca-atlas-tracker/issues/486)) ([a36d125](https://github.com/clevercanary/hca-atlas-tracker/commit/a36d1258710132a556e95b807813b0d108ee2525))
* add doi input to atlas forms ([#485](https://github.com/clevercanary/hca-atlas-tracker/issues/485)) ([#497](https://github.com/clevercanary/hca-atlas-tracker/issues/497)) ([168d66f](https://github.com/clevercanary/hca-atlas-tracker/commit/168d66f2b529a19a5418ccf13387cb5f16bca2bf))
* add metadata specification field to atlas edit form ([#488](https://github.com/clevercanary/hca-atlas-tracker/issues/488)) ([#499](https://github.com/clevercanary/hca-atlas-tracker/issues/499)) ([aab4f67](https://github.com/clevercanary/hca-atlas-tracker/commit/aab4f67bf03c5fc107b5a9dc097cd47c008b86a0))
* add publication column to atlas source datasets list and make related adjustments ([#490](https://github.com/clevercanary/hca-atlas-tracker/issues/490)) ([#501](https://github.com/clevercanary/hca-atlas-tracker/issues/501)) ([6d51232](https://github.com/clevercanary/hca-atlas-tracker/commit/6d51232d0b30cd7258f058fb70b6f0217a582fa1))
* add release please to automate releases ([#435](https://github.com/clevercanary/hca-atlas-tracker/issues/435)) ([#446](https://github.com/clevercanary/hca-atlas-tracker/issues/446)) ([7642198](https://github.com/clevercanary/hca-atlas-tracker/commit/76421987b118d49eed746b50b9f64fcbc037c320))
* add source dataset count to atlas list ([#494](https://github.com/clevercanary/hca-atlas-tracker/issues/494)) ([#507](https://github.com/clevercanary/hca-atlas-tracker/issues/507)) ([bb32b0e](https://github.com/clevercanary/hca-atlas-tracker/commit/bb32b0e0115c41ce50118de77d1030e5026b7518))
* add status input to atlas edit form ([#495](https://github.com/clevercanary/hca-atlas-tracker/issues/495)) ([#509](https://github.com/clevercanary/hca-atlas-tracker/issues/509)) ([0a9ae14](https://github.com/clevercanary/hca-atlas-tracker/commit/0a9ae14f52416890d7c2569577061e1fd8c90ef6))
* add title to atlas cellxgene collection input ([#505](https://github.com/clevercanary/hca-atlas-tracker/issues/505)) ([#506](https://github.com/clevercanary/hca-atlas-tracker/issues/506)) ([2784028](https://github.com/clevercanary/hca-atlas-tracker/commit/27840288e9fcf2cd1bb861d58121eef589cf9775))
* add version info to footer ([#459](https://github.com/clevercanary/hca-atlas-tracker/issues/459)) ([#460](https://github.com/clevercanary/hca-atlas-tracker/issues/460)) ([04d5089](https://github.com/clevercanary/hca-atlas-tracker/commit/04d5089cbd11ecf26fdca91fd9a5b1b510860867))
* allow adding/removing integration leads ([#456](https://github.com/clevercanary/hca-atlas-tracker/issues/456)) ([#463](https://github.com/clevercanary/hca-atlas-tracker/issues/463)) ([42e82db](https://github.com/clevercanary/hca-atlas-tracker/commit/42e82db7f1f05e2960ccca32695a49fc101f393a))
* allow linking source datasets to atlases ([#467](https://github.com/clevercanary/hca-atlas-tracker/issues/467)) ([#479](https://github.com/clevercanary/hca-atlas-tracker/issues/479)) ([73bd56a](https://github.com/clevercanary/hca-atlas-tracker/commit/73bd56a069f23d44adfcf17572d6f383a17a35c0))
* create account automatically when unregistered user logs in ([#464](https://github.com/clevercanary/hca-atlas-tracker/issues/464)) ([#466](https://github.com/clevercanary/hca-atlas-tracker/issues/466)) ([8a9bff3](https://github.com/clevercanary/hca-atlas-tracker/commit/8a9bff36719f899eb23c67eab248ab7718b3d3a9))
* implement group by for lists ([#414](https://github.com/clevercanary/hca-atlas-tracker/issues/414)) ([#500](https://github.com/clevercanary/hca-atlas-tracker/issues/500)) ([d03023f](https://github.com/clevercanary/hca-atlas-tracker/commit/d03023f72ad1a4936ba4a0eb1fda0c7eef07f283))
* include entity lists in breadcrumbs ([#471](https://github.com/clevercanary/hca-atlas-tracker/issues/471)) ([#474](https://github.com/clevercanary/hca-atlas-tracker/issues/474)) ([36f6548](https://github.com/clevercanary/hca-atlas-tracker/commit/36f6548ad622f348b71207899dd19c24f17de26c))
* make atlas wave and integration lead columns hidden by default ([#491](https://github.com/clevercanary/hca-atlas-tracker/issues/491)) ([#508](https://github.com/clevercanary/hca-atlas-tracker/issues/508)) ([755091a](https://github.com/clevercanary/hca-atlas-tracker/commit/755091aa01adaa5a3bb9bbb8df7418a2339b8820))
* option to add row count on tables ([#415](https://github.com/clevercanary/hca-atlas-tracker/issues/415)) ([#465](https://github.com/clevercanary/hca-atlas-tracker/issues/465)) ([ce461e0](https://github.com/clevercanary/hca-atlas-tracker/commit/ce461e01cf60eef3def2aeff5a115f427d97b145))
* rename source study source datasets to "datasets" in ui ([#470](https://github.com/clevercanary/hca-atlas-tracker/issues/470)) ([#473](https://github.com/clevercanary/hca-atlas-tracker/issues/473)) ([16cd346](https://github.com/clevercanary/hca-atlas-tracker/commit/16cd3463abc8f89e1d8c40fa7b5626369dc7e7d3))
* revert label from "Deadline" to "Target Completion" ([#512](https://github.com/clevercanary/hca-atlas-tracker/issues/512)) ([#518](https://github.com/clevercanary/hca-atlas-tracker/issues/518)) ([b0dd4ee](https://github.com/clevercanary/hca-atlas-tracker/commit/b0dd4ee4ae63e1b2765d9f011472e221f6603996))
* set version environment variables during builds ([#521](https://github.com/clevercanary/hca-atlas-tracker/issues/521)) ([#522](https://github.com/clevercanary/hca-atlas-tracker/issues/522)) ([dfa07a9](https://github.com/clevercanary/hca-atlas-tracker/commit/dfa07a9c0640de56f861564dcfa8a327c6403a06))
* update findable-ui to latest v21.0.0 ([#516](https://github.com/clevercanary/hca-atlas-tracker/issues/516)) ([#517](https://github.com/clevercanary/hca-atlas-tracker/issues/517)) ([c7acf5f](https://github.com/clevercanary/hca-atlas-tracker/commit/c7acf5fd4baa6d950ed0cf5329c532e75bf15d3f))


### Bug Fixes

* add venv to pretier ignore ([#447](https://github.com/clevercanary/hca-atlas-tracker/issues/447)) ([#449](https://github.com/clevercanary/hca-atlas-tracker/issues/449)) ([d47a1ad](https://github.com/clevercanary/hca-atlas-tracker/commit/d47a1ad5204746b5ff22ddcefdd2f308dbc9873a))
* avoid error when saving published source study ([#496](https://github.com/clevercanary/hca-atlas-tracker/issues/496)) ([#510](https://github.com/clevercanary/hca-atlas-tracker/issues/510)) ([c1a152c](https://github.com/clevercanary/hca-atlas-tracker/commit/c1a152c05279bfd54b359a1f3906a62cd752ba45))
* disabled integration lead buttons when user doesn't have edit access ([#513](https://github.com/clevercanary/hca-atlas-tracker/issues/513)) ([#514](https://github.com/clevercanary/hca-atlas-tracker/issues/514)) ([9d2a0a9](https://github.com/clevercanary/hca-atlas-tracker/commit/9d2a0a97d598ae84532a6de89451b1f33101ca31))
* resolve error when searching `disabled` filter ([#493](https://github.com/clevercanary/hca-atlas-tracker/issues/493)) ([#498](https://github.com/clevercanary/hca-atlas-tracker/issues/498)) ([5e081af](https://github.com/clevercanary/hca-atlas-tracker/commit/5e081af62822a7de85dfd1f24643a5c8eef9d3a4))
* simplify release please config and remove pat ([#452](https://github.com/clevercanary/hca-atlas-tracker/issues/452)) ([#453](https://github.com/clevercanary/hca-atlas-tracker/issues/453)) ([b74860e](https://github.com/clevercanary/hca-atlas-tracker/commit/b74860e7ed8e88a6661f0fc6a00e7d2cc96e237f))


### Chores

* add `content` commit type to commitlint config ([#454](https://github.com/clevercanary/hca-atlas-tracker/issues/454)) ([#455](https://github.com/clevercanary/hca-atlas-tracker/issues/455)) ([88030bd](https://github.com/clevercanary/hca-atlas-tracker/commit/88030bdd987454bde26a40ca3f985d04e951af6f))
* removed the 'no.' after 'DOI no.' ([#469](https://github.com/clevercanary/hca-atlas-tracker/issues/469)) ([#480](https://github.com/clevercanary/hca-atlas-tracker/issues/480)) ([0561003](https://github.com/clevercanary/hca-atlas-tracker/commit/0561003518d8fc50287c4ba19057e3a84b0e6463))
* updated findable-ui to latest v20.0.0 ([#511](https://github.com/clevercanary/hca-atlas-tracker/issues/511)) ([#515](https://github.com/clevercanary/hca-atlas-tracker/issues/515)) ([4d719f4](https://github.com/clevercanary/hca-atlas-tracker/commit/4d719f425b4fab7417f9dd06dbb6560696974c66))
* upgrade findable-ui to 14.0.0 ([#431](https://github.com/clevercanary/hca-atlas-tracker/issues/431)) ([#450](https://github.com/clevercanary/hca-atlas-tracker/issues/450)) ([797a445](https://github.com/clevercanary/hca-atlas-tracker/commit/797a4452e20064e19a0885f9e3956c8c68d2cb4f))
* upgrade findable-ui to 15.0.0 ([#457](https://github.com/clevercanary/hca-atlas-tracker/issues/457)) ([#458](https://github.com/clevercanary/hca-atlas-tracker/issues/458)) ([eac0e69](https://github.com/clevercanary/hca-atlas-tracker/commit/eac0e696bf0fa70d420bde49a50da5e1f3dfe101))


### Content

* replace "requesting access" page with "requesting elevated permissions" ([#475](https://github.com/clevercanary/hca-atlas-tracker/issues/475)) ([#477](https://github.com/clevercanary/hca-atlas-tracker/issues/477)) ([14fd3a4](https://github.com/clevercanary/hca-atlas-tracker/commit/14fd3a4f835c54d633703b4b2a95ddb098c0e269))
