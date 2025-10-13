# Changelog

## [1.42.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.41.0...v1.42.0) (2025-10-13)


### Features

* archive and unarchive source datasets and integrated objects ui ([#922](https://github.com/clevercanary/hca-atlas-tracker/issues/922)) ([#930](https://github.com/clevercanary/hca-atlas-tracker/issues/930)) ([9f0e83f](https://github.com/clevercanary/hca-atlas-tracker/commit/9f0e83f0cfbb384c636b56ecb2c370775b829d7a))
* update and add apis to support interactions with file archiving ([#921](https://github.com/clevercanary/hca-atlas-tracker/issues/921)) ([#924](https://github.com/clevercanary/hca-atlas-tracker/issues/924)) ([84c1c90](https://github.com/clevercanary/hca-atlas-tracker/commit/84c1c907cf5d356c2f9815e5aad2a888e1d365ae))


### Chores

* update findable-ui to latest ([#908](https://github.com/clevercanary/hca-atlas-tracker/issues/908)) ([#912](https://github.com/clevercanary/hca-atlas-tracker/issues/912)) ([adfef39](https://github.com/clevercanary/hca-atlas-tracker/commit/adfef391d6a56069ad6ed475de30c8d66edb002c))

## [1.41.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.40.0...v1.41.0) (2025-10-08)


### Features

* increase the session inactivity timeout to 1 hour ([#472](https://github.com/clevercanary/hca-atlas-tracker/issues/472)) ([#925](https://github.com/clevercanary/hca-atlas-tracker/issues/925)) ([5bab748](https://github.com/clevercanary/hca-atlas-tracker/commit/5bab748fb7b8bb7aa64bf8f6d49f29ccefda360a))


### Bug Fixes

* reduce page size used for hca api to 75 ([#927](https://github.com/clevercanary/hca-atlas-tracker/issues/927)) ([#928](https://github.com/clevercanary/hca-atlas-tracker/issues/928)) ([89f3e3a](https://github.com/clevercanary/hca-atlas-tracker/commit/89f3e3aaa4a4d61320b40c6feafb753c06cd765c))

## [1.40.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.39.0...v1.40.0) (2025-10-06)


### Features

* add archived/non-archived status to files ([#919](https://github.com/clevercanary/hca-atlas-tracker/issues/919)) ([#920](https://github.com/clevercanary/hca-atlas-tracker/issues/920)) ([b64de9c](https://github.com/clevercanary/hca-atlas-tracker/commit/b64de9c83711edd592d6530a379a03edb46fe439))


### Code Refactoring

* separate source dataset retrieval queries into data layer with less duplication ([#916](https://github.com/clevercanary/hca-atlas-tracker/issues/916)) ([#917](https://github.com/clevercanary/hca-atlas-tracker/issues/917)) ([3cfa846](https://github.com/clevercanary/hca-atlas-tracker/commit/3cfa846cb6931035f78f6b4ac2a9da4c11adfda6))

## [1.39.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.38.0...v1.39.0) (2025-10-03)


### Features

* add file name to file download dialog ([#901](https://github.com/clevercanary/hca-atlas-tracker/issues/901)) ([#902](https://github.com/clevercanary/hca-atlas-tracker/issues/902)) ([20f32cb](https://github.com/clevercanary/hca-atlas-tracker/commit/20f32cb51134452124f5e0e65166e6d2e934e247))
* save cellxgene results in validation results and summary ([#906](https://github.com/clevercanary/hca-atlas-tracker/issues/906)) ([#914](https://github.com/clevercanary/hca-atlas-tracker/issues/914)) ([ecfcd49](https://github.com/clevercanary/hca-atlas-tracker/commit/ecfcd496715a90815771578bd44a0facabe81f9b))
* show cellxgene validation status in the source dataset and integrated object lists ([#911](https://github.com/clevercanary/hca-atlas-tracker/issues/911)) ([#915](https://github.com/clevercanary/hca-atlas-tracker/issues/915)) ([5662916](https://github.com/clevercanary/hca-atlas-tracker/commit/566291684fb67c83f2846071be65d4ca68f642f5))

## [1.38.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.37.0...v1.38.0) (2025-09-29)


### Features

* add api to get a presigned download url for a file ([#873](https://github.com/clevercanary/hca-atlas-tracker/issues/873)) ([#891](https://github.com/clevercanary/hca-atlas-tracker/issues/891)) ([c6424c5](https://github.com/clevercanary/hca-atlas-tracker/commit/c6424c5407eeea236dc125cd670e236b6df20e76))
* copy pre-signed url ([#867](https://github.com/clevercanary/hca-atlas-tracker/issues/867)) ([#893](https://github.com/clevercanary/hca-atlas-tracker/issues/893)) ([0bf3469](https://github.com/clevercanary/hca-atlas-tracker/commit/0bf3469a6c1a0397e31c852bad2aa835e8ded68a))
* download file ([#868](https://github.com/clevercanary/hca-atlas-tracker/issues/868)) ([#894](https://github.com/clevercanary/hca-atlas-tracker/issues/894)) ([453a239](https://github.com/clevercanary/hca-atlas-tracker/commit/453a239be430805c8e770950d74d6046699819a3))
* include filename in content-disposition header for presigned download urls ([#895](https://github.com/clevercanary/hca-atlas-tracker/issues/895)) ([#896](https://github.com/clevercanary/hca-atlas-tracker/issues/896)) ([9bd40f5](https://github.com/clevercanary/hca-atlas-tracker/commit/9bd40f50adfb2307a39cf07c4a7cb2feb104d555))
* link validation summary in tables to validation detail pages ([#899](https://github.com/clevercanary/hca-atlas-tracker/issues/899)) ([#900](https://github.com/clevercanary/hca-atlas-tracker/issues/900)) ([64a6a5e](https://github.com/clevercanary/hca-atlas-tracker/commit/64a6a5ed2b0731799556e5a350bb6aebb299c309))
* update source dataset list to be like integrated object list for title and file name ([#897](https://github.com/clevercanary/hca-atlas-tracker/issues/897)) ([#898](https://github.com/clevercanary/hca-atlas-tracker/issues/898)) ([b44c61a](https://github.com/clevercanary/hca-atlas-tracker/commit/b44c61aa5d2aefa29e475e83d01ce3e44f7c6a38))


### Bug Fixes

* fix select drop down shadow ([#851](https://github.com/clevercanary/hca-atlas-tracker/issues/851)) ([#890](https://github.com/clevercanary/hca-atlas-tracker/issues/890)) ([11589e8](https://github.com/clevercanary/hca-atlas-tracker/commit/11589e857edff4d0167d4f6142a938412d4202e8))

## [1.37.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.36.0...v1.37.0) (2025-09-26)


### Features

* add validation summary to source dataset and integrated object tables ([#874](https://github.com/clevercanary/hca-atlas-tracker/issues/874)) ([#886](https://github.com/clevercanary/hca-atlas-tracker/issues/886)) ([cb2da6e](https://github.com/clevercanary/hca-atlas-tracker/commit/cb2da6e988615dc91481af006a73dbb3fff50dc2))
* include validation reports when generating validation results for local development ([#884](https://github.com/clevercanary/hca-atlas-tracker/issues/884)) ([#885](https://github.com/clevercanary/hca-atlas-tracker/issues/885)) ([e3750fb](https://github.com/clevercanary/hca-atlas-tracker/commit/e3750fb6a566d2ed798388f97bee16acbdd64112))
* return validation reports from atlas source dataset and component atlas detail apis ([#864](https://github.com/clevercanary/hca-atlas-tracker/issues/864)) ([#887](https://github.com/clevercanary/hca-atlas-tracker/issues/887)) ([0a3ab8b](https://github.com/clevercanary/hca-atlas-tracker/commit/0a3ab8b99b8396669259ac112f69a1ebae8a2778))
* return validation summary from source dataset and integrated object apis ([#863](https://github.com/clevercanary/hca-atlas-tracker/issues/863)) ([#880](https://github.com/clevercanary/hca-atlas-tracker/issues/880)) ([07ead26](https://github.com/clevercanary/hca-atlas-tracker/commit/07ead264ba6355e6b0e7795271d2733356694ef1))
* show validation details on source dataset and integrated object detail pages ([#875](https://github.com/clevercanary/hca-atlas-tracker/issues/875)) ([#888](https://github.com/clevercanary/hca-atlas-tracker/issues/888)) ([9c02b20](https://github.com/clevercanary/hca-atlas-tracker/commit/9c02b201c6f0c809bdc8845940029454ba325e24))


### Tests

* hide console messages in validate all files api test ([#882](https://github.com/clevercanary/hca-atlas-tracker/issues/882)) ([#883](https://github.com/clevercanary/hca-atlas-tracker/issues/883)) ([7527365](https://github.com/clevercanary/hca-atlas-tracker/commit/75273652811e8666730928cd0dbe58cbf62c2c29))

## [1.36.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.35.0...v1.36.0) (2025-09-24)


### Features

* log invalid json from sns messages ([#876](https://github.com/clevercanary/hca-atlas-tracker/issues/876)) ([#878](https://github.com/clevercanary/hca-atlas-tracker/issues/878)) ([446fc1e](https://github.com/clevercanary/hca-atlas-tracker/commit/446fc1e728ccf7da2000bba5379cc2006ffc9cd3))
* save cap validation report and validation summary to files table ([#862](https://github.com/clevercanary/hca-atlas-tracker/issues/862)) ([#877](https://github.com/clevercanary/hca-atlas-tracker/issues/877)) ([33365c3](https://github.com/clevercanary/hca-atlas-tracker/commit/33365c3a402da9ecab6435b0c6739ac9d4358de9))

## [1.35.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.34.0...v1.35.0) (2025-09-21)


### Features

* add api and interface for starting validation of all files ([#858](https://github.com/clevercanary/hca-atlas-tracker/issues/858)) ([#860](https://github.com/clevercanary/hca-atlas-tracker/issues/860)) ([514a3b0](https://github.com/clevercanary/hca-atlas-tracker/commit/514a3b06feea5d7e89519fde0fdaefc841e0c6bd))

## [1.34.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.33.0...v1.34.0) (2025-09-19)


### Features

* update process of starting file validation and of handling of validation status ([#847](https://github.com/clevercanary/hca-atlas-tracker/issues/847)) ([#856](https://github.com/clevercanary/hca-atlas-tracker/issues/856)) ([5d046d9](https://github.com/clevercanary/hca-atlas-tracker/commit/5d046d956aa1f7a1aa08dcd2370edad5adcc1644))


### Bug Fixes

* fix fallback message for empty integration objects and other similar pages ([#774](https://github.com/clevercanary/hca-atlas-tracker/issues/774)) ([#854](https://github.com/clevercanary/hca-atlas-tracker/issues/854)) ([a91a871](https://github.com/clevercanary/hca-atlas-tracker/commit/a91a8715d9f810802da65c2d4f222d0bf12d0288))
* make atlas source dataset and metadata pages visible to stakeholders ([#857](https://github.com/clevercanary/hca-atlas-tracker/issues/857)) ([#859](https://github.com/clevercanary/hca-atlas-tracker/issues/859)) ([234d497](https://github.com/clevercanary/hca-atlas-tracker/commit/234d4977f449035657e762762baf05e84b04d02a))

## [1.33.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.32.0...v1.33.0) (2025-09-18)


### Features

* add api and database column for setting reprocessed status of source datasets ([#842](https://github.com/clevercanary/hca-atlas-tracker/issues/842)) ([#850](https://github.com/clevercanary/hca-atlas-tracker/issues/850)) ([222b112](https://github.com/clevercanary/hca-atlas-tracker/commit/222b11220bbcccf920aad5e78797877f7b86f22f))
* front end for setting "reprocessed status" on source datasets ([#843](https://github.com/clevercanary/hca-atlas-tracker/issues/843)) ([#853](https://github.com/clevercanary/hca-atlas-tracker/issues/853)) ([f0e2522](https://github.com/clevercanary/hca-atlas-tracker/commit/f0e2522097def08a3641f8a160d18502b5283aad))

## [1.32.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.31.0...v1.32.0) (2025-09-17)


### Features

* start validation job when a file is added or updated ([#839](https://github.com/clevercanary/hca-atlas-tracker/issues/839)) ([#846](https://github.com/clevercanary/hca-atlas-tracker/issues/846)) ([c25c3ac](https://github.com/clevercanary/hca-atlas-tracker/commit/c25c3acbe532e9d9d4de6b54305288bff824b62e))

## [1.31.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.30.0...v1.31.0) (2025-09-16)


### Features

* handle validation result sns messages ([#803](https://github.com/clevercanary/hca-atlas-tracker/issues/803)) ([#830](https://github.com/clevercanary/hca-atlas-tracker/issues/830)) ([d0f79fd](https://github.com/clevercanary/hca-atlas-tracker/commit/d0f79fd49c20b74de43dd31b28c23db4c94e13b6))
* use dataset info from files for source dataset api responses ([#832](https://github.com/clevercanary/hca-atlas-tracker/issues/832)) ([#836](https://github.com/clevercanary/hca-atlas-tracker/issues/836)) ([c0a510b](https://github.com/clevercanary/hca-atlas-tracker/commit/c0a510bc362cd2f93dcd3cbaef06150c615378f0))
* use metadata from files in component atlas api responses ([#837](https://github.com/clevercanary/hca-atlas-tracker/issues/837)) ([#841](https://github.com/clevercanary/hca-atlas-tracker/issues/841)) ([6d4e3fa](https://github.com/clevercanary/hca-atlas-tracker/commit/6d4e3fa6b1feef948b81df58af9686834f834e47))


### Bug Fixes

* use latest file version where unspecified for source dataset and integrated object apis ([#840](https://github.com/clevercanary/hca-atlas-tracker/issues/840)) ([#844](https://github.com/clevercanary/hca-atlas-tracker/issues/844)) ([ff09c8d](https://github.com/clevercanary/hca-atlas-tracker/commit/ff09c8d5c1193f60df7c1303f266aeaebddea212))


### Chores

* **batch:** add validator batch submit service and tests ([#834](https://github.com/clevercanary/hca-atlas-tracker/issues/834)) ([#838](https://github.com/clevercanary/hca-atlas-tracker/issues/838)) ([1e2652e](https://github.com/clevercanary/hca-atlas-tracker/commit/1e2652eda053a52b79bad5eff7feb0044c28a7e9))

## [1.30.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.29.0...v1.30.0) (2025-09-11)


### Features

* provide a "no metadata entry sheets" message when there are no entry sheets ([#757](https://github.com/clevercanary/hca-atlas-tracker/issues/757)) ([#824](https://github.com/clevercanary/hca-atlas-tracker/issues/824)) ([80a34b0](https://github.com/clevercanary/hca-atlas-tracker/commit/80a34b039ce2fe6e8751be88f9c9ffba010f76bb))
* provide a proper "no integrated objects" message for the atlas integrated objects ([#820](https://github.com/clevercanary/hca-atlas-tracker/issues/820)) ([#826](https://github.com/clevercanary/hca-atlas-tracker/issues/826)) ([f7a9988](https://github.com/clevercanary/hca-atlas-tracker/commit/f7a99887ef5cdf3ca2148c2015a6d9c69f9a8771))
* remove cellxgene collections count from atlases list ([#821](https://github.com/clevercanary/hca-atlas-tracker/issues/821)) ([#827](https://github.com/clevercanary/hca-atlas-tracker/issues/827)) ([7494b0c](https://github.com/clevercanary/hca-atlas-tracker/commit/7494b0cd210ac89a146a1391297be75625d4402f))
* remove the cellxgene column form the source studies page ([#822](https://github.com/clevercanary/hca-atlas-tracker/issues/822)) ([#828](https://github.com/clevercanary/hca-atlas-tracker/issues/828)) ([62689e9](https://github.com/clevercanary/hca-atlas-tracker/commit/62689e9ed66ed26d8e8d9bf262205500d91738eb))
* update banner help text for key entities ([#819](https://github.com/clevercanary/hca-atlas-tracker/issues/819)) ([#823](https://github.com/clevercanary/hca-atlas-tracker/issues/823)) ([b9c6c68](https://github.com/clevercanary/hca-atlas-tracker/commit/b9c6c68e08e607e671d5f99423e346e10e34bb65))
* update metadata correctness 'no entry sheets' to use tableplaceholder component ([#758](https://github.com/clevercanary/hca-atlas-tracker/issues/758)) ([#825](https://github.com/clevercanary/hca-atlas-tracker/issues/825)) ([90a78b2](https://github.com/clevercanary/hca-atlas-tracker/commit/90a78b294dfc0ca0bb8f9aad2ef066de47a200fa))

## [1.29.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.28.0...v1.29.0) (2025-09-10)


### Features

* source dataset column tweaks ([#815](https://github.com/clevercanary/hca-atlas-tracker/issues/815)) ([#817](https://github.com/clevercanary/hca-atlas-tracker/issues/817)) ([3190b94](https://github.com/clevercanary/hca-atlas-tracker/commit/3190b94eef8f70c654951d4a0f376e00ff96c723))

## [1.28.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.27.0...v1.28.0) (2025-09-10)


### Features

* add file fields to source source datasets ([#812](https://github.com/clevercanary/hca-atlas-tracker/issues/812)) ([#816](https://github.com/clevercanary/hca-atlas-tracker/issues/816)) ([6abdb72](https://github.com/clevercanary/hca-atlas-tracker/commit/6abdb725422451b44084ebd350f9138041d1850d))
* add file name, size, and validation status to source dataset api responses ([#812](https://github.com/clevercanary/hca-atlas-tracker/issues/812)) ([#813](https://github.com/clevercanary/hca-atlas-tracker/issues/813)) ([bac8769](https://github.com/clevercanary/hca-atlas-tracker/commit/bac8769ddb78061d68c69f6e5dff13498e009397))

## [1.27.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.26.0...v1.27.0) (2025-09-09)


### Features

* add api to accept SNS notifications of S3 file added ([#736](https://github.com/clevercanary/hca-atlas-tracker/issues/736)) ([#737](https://github.com/clevercanary/hca-atlas-tracker/issues/737)) ([83bec66](https://github.com/clevercanary/hca-atlas-tracker/commit/83bec663ad34bfa63ecbf7ec4ee96b8083816a6d))
* add back source datasets tab to atlas ([#794](https://github.com/clevercanary/hca-atlas-tracker/issues/794)) ([#799](https://github.com/clevercanary/hca-atlas-tracker/issues/799)) ([2b898bc](https://github.com/clevercanary/hca-atlas-tracker/commit/2b898bc2d57bb266619c3dcb38cb814bdaa9f37f))
* add page to sync files from s3 ([#801](https://github.com/clevercanary/hca-atlas-tracker/issues/801)) ([#804](https://github.com/clevercanary/hca-atlas-tracker/issues/804)) ([b93cb72](https://github.com/clevercanary/hca-atlas-tracker/commit/b93cb72213bd202399f48f9d85888d8469960b1b))
* add script to generate fake files in the database ([#772](https://github.com/clevercanary/hca-atlas-tracker/issues/772)) ([#776](https://github.com/clevercanary/hca-atlas-tracker/issues/776)) ([490a59a](https://github.com/clevercanary/hca-atlas-tracker/commit/490a59adb335dfcee131b4fd5de687dee639e23f))
* allow the integrated objects list to take up the full width of the page ([#760](https://github.com/clevercanary/hca-atlas-tracker/issues/760)) ([#777](https://github.com/clevercanary/hca-atlas-tracker/issues/777)) ([cb2bb46](https://github.com/clevercanary/hca-atlas-tracker/commit/cb2bb461b7bd055316149749a3c4f6d41e64381a))
* derive integrated object get api responses from files ([#753](https://github.com/clevercanary/hca-atlas-tracker/issues/753)) ([#766](https://github.com/clevercanary/hca-atlas-tracker/issues/766)) ([8255897](https://github.com/clevercanary/hca-atlas-tracker/commit/8255897c19e82b76805e8440a622bb64a7c3e620))
* don't do automatic creation or updating of cellxgene source datasets ([#802](https://github.com/clevercanary/hca-atlas-tracker/issues/802)) ([#806](https://github.com/clevercanary/hca-atlas-tracker/issues/806)) ([76fe2ce](https://github.com/clevercanary/hca-atlas-tracker/commit/76fe2ce7dab5544d34481251d10f9fe2a03304cc))
* don't load cellxgene dataset list ([#808](https://github.com/clevercanary/hca-atlas-tracker/issues/808)) ([#811](https://github.com/clevercanary/hca-atlas-tracker/issues/811)) ([0cae6d0](https://github.com/clevercanary/hca-atlas-tracker/commit/0cae6d0ff5e86e7313097c93f2d36fefa255cd2e))
* Immediate file visibility for new integrated objects  ([#781](https://github.com/clevercanary/hca-atlas-tracker/issues/781)) ([#782](https://github.com/clevercanary/hca-atlas-tracker/issues/782)) ([b929f10](https://github.com/clevercanary/hca-atlas-tracker/commit/b929f10ffd0f54646db95b96b5f8b22a06075909))
* make the title not editable on the integrated object detail page general Info section ([#755](https://github.com/clevercanary/hca-atlas-tracker/issues/755)) ([#773](https://github.com/clevercanary/hca-atlas-tracker/issues/773)) ([a2b2626](https://github.com/clevercanary/hca-atlas-tracker/commit/a2b2626b00b6e2a88a5c507e3ce0491427c9ac9d))
* migrate text references to 'integrated object' throughout the site ([#770](https://github.com/clevercanary/hca-atlas-tracker/issues/770)) ([#778](https://github.com/clevercanary/hca-atlas-tracker/issues/778)) ([070b683](https://github.com/clevercanary/hca-atlas-tracker/commit/070b683e0497f377168dd63cb461a25ff69a8510))
* move the path of integrated objects to atlases/{atlas_id}/integrated-objects ([#751](https://github.com/clevercanary/hca-atlas-tracker/issues/751)) ([#764](https://github.com/clevercanary/hca-atlas-tracker/issues/764)) ([64fae44](https://github.com/clevercanary/hca-atlas-tracker/commit/64fae44ea476e67deca78e441ccdc9f0fb2d4091))
* remove 'createintegrated object' page and related code ([#763](https://github.com/clevercanary/hca-atlas-tracker/issues/763)) ([#768](https://github.com/clevercanary/hca-atlas-tracker/issues/768)) ([fffea54](https://github.com/clevercanary/hca-atlas-tracker/commit/fffea548a4111d7fa645591683ca397d87bd73fb))
* remove 'delete integrated object' ui and rel fns in the front end ([#767](https://github.com/clevercanary/hca-atlas-tracker/issues/767)) ([#769](https://github.com/clevercanary/hca-atlas-tracker/issues/769)) ([4597572](https://github.com/clevercanary/hca-atlas-tracker/commit/4597572c7b307a5be720fcddcb186da9aba4afec))
* remove "used in atlas" and other columns from atlas source study / source datasets ([#800](https://github.com/clevercanary/hca-atlas-tracker/issues/800)) ([#805](https://github.com/clevercanary/hca-atlas-tracker/issues/805)) ([46c9e2f](https://github.com/clevercanary/hca-atlas-tracker/commit/46c9e2f235416df97b066e068a602f4997faa608))
* remove soon-obsolete write apis for integrated objects ([#750](https://github.com/clevercanary/hca-atlas-tracker/issues/750)) ([#756](https://github.com/clevercanary/hca-atlas-tracker/issues/756)) ([f7546cf](https://github.com/clevercanary/hca-atlas-tracker/commit/f7546cf728179e52212ecf03e592ebe29a724ec2))
* remove the 'add integration object' button from the component atlases page ([#749](https://github.com/clevercanary/hca-atlas-tracker/issues/749)) ([#762](https://github.com/clevercanary/hca-atlas-tracker/issues/762)) ([fd45cb0](https://github.com/clevercanary/hca-atlas-tracker/commit/fd45cb023f9c33b03b16c9c83d50ca0ec6d5f1a1))
* rename datasets used to datasets on alas source studies ([#795](https://github.com/clevercanary/hca-atlas-tracker/issues/795)) ([#796](https://github.com/clevercanary/hca-atlas-tracker/issues/796)) ([9476de9](https://github.com/clevercanary/hca-atlas-tracker/commit/9476de9b3b1cc318eaea342d1b3ce340271a77cb))
* rename tab to 'integrated objects' (instead of integration objects) ([#752](https://github.com/clevercanary/hca-atlas-tracker/issues/752)) ([#765](https://github.com/clevercanary/hca-atlas-tracker/issues/765)) ([e9b3857](https://github.com/clevercanary/hca-atlas-tracker/commit/e9b38577882688ded12426fb7d3223758f8f57f5))
* update integrated object list columns to include file and status information ([#754](https://github.com/clevercanary/hca-atlas-tracker/issues/754)) ([#779](https://github.com/clevercanary/hca-atlas-tracker/issues/779)) ([7909c7e](https://github.com/clevercanary/hca-atlas-tracker/commit/7909c7ec1534a8db8903582cba568b98724dc97e))
* update the general info section on the integrated object detail page ([#771](https://github.com/clevercanary/hca-atlas-tracker/issues/771)) ([#780](https://github.com/clevercanary/hca-atlas-tracker/issues/780)) ([5a5f48e](https://github.com/clevercanary/hca-atlas-tracker/commit/5a5f48e05b053bcc052f01c8306735dc2b80405a))


### Bug Fixes

* use schemas for aws types ([#784](https://github.com/clevercanary/hca-atlas-tracker/issues/784)) ([#810](https://github.com/clevercanary/hca-atlas-tracker/issues/810)) ([cc53bcc](https://github.com/clevercanary/hca-atlas-tracker/commit/cc53bccc69ec93d65d440833993f9635d5f42df4))


### Tests

* add separate function to cover broadened `withConsoleErrorHiding` behavior ([#786](https://github.com/clevercanary/hca-atlas-tracker/issues/786), [#787](https://github.com/clevercanary/hca-atlas-tracker/issues/787)) ([#788](https://github.com/clevercanary/hca-atlas-tracker/issues/788)) ([a940b43](https://github.com/clevercanary/hca-atlas-tracker/commit/a940b433d153b2ab1071b251b130d727ab1ede7e))

## [1.26.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.25.0...v1.26.0) (2025-08-13)


### Features

* add api to get heatmap data ([#728](https://github.com/clevercanary/hca-atlas-tracker/issues/728)) ([#738](https://github.com/clevercanary/hca-atlas-tracker/issues/738)) ([1d1b9d8](https://github.com/clevercanary/hca-atlas-tracker/commit/1d1b9d89d95040c53c5174bd1d6b6aaf19ce4a2c))
* metadata completeness heatmap ([#729](https://github.com/clevercanary/hca-atlas-tracker/issues/729)) ([#739](https://github.com/clevercanary/hca-atlas-tracker/issues/739)) ([7804f4d](https://github.com/clevercanary/hca-atlas-tracker/commit/7804f4d59748e66867632650493f405ee581c291))


### Chores

* update cellxgene files info ([#740](https://github.com/clevercanary/hca-atlas-tracker/issues/740)) ([#744](https://github.com/clevercanary/hca-atlas-tracker/issues/744)) ([7dd79d8](https://github.com/clevercanary/hca-atlas-tracker/commit/7dd79d8cb41a41a10f288106ba6938851cff813b))

## [1.25.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.24.0...v1.25.0) (2025-08-04)


### Features

* validation report - link column name to data dictionary ([#723](https://github.com/clevercanary/hca-atlas-tracker/issues/723)) ([#730](https://github.com/clevercanary/hca-atlas-tracker/issues/730)) ([bac81d2](https://github.com/clevercanary/hca-atlas-tracker/commit/bac81d2a1e77965d559fdf4b1a80e0156778a76d))


### Bug Fixes

* update metadata report link to data dictionary tier 1 ([#732](https://github.com/clevercanary/hca-atlas-tracker/issues/732)) ([#735](https://github.com/clevercanary/hca-atlas-tracker/issues/735)) ([b02e7f6](https://github.com/clevercanary/hca-atlas-tracker/commit/b02e7f6105e1b2ca00c1af4c3b54f1ab70433f8b))


### Chores

* update findable-ui to latest verion v41.2.0 ([#733](https://github.com/clevercanary/hca-atlas-tracker/issues/733)) ([#734](https://github.com/clevercanary/hca-atlas-tracker/issues/734)) ([05390cb](https://github.com/clevercanary/hca-atlas-tracker/commit/05390cb5c4ce8396a83b1616ebc9f867e85446f9))

## [1.24.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.23.0...v1.24.0) (2025-07-23)


### Features

* add stats to metadata validation report page ([#721](https://github.com/clevercanary/hca-atlas-tracker/issues/721)) ([#726](https://github.com/clevercanary/hca-atlas-tracker/issues/726)) ([5db618e](https://github.com/clevercanary/hca-atlas-tracker/commit/5db618ed61841b26e861584963bb5ab3261305c7))

## [1.23.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.22.0...v1.23.0) (2025-07-22)


### Features

* update metadata entry sheet validation report ([#720](https://github.com/clevercanary/hca-atlas-tracker/issues/720)) ([#724](https://github.com/clevercanary/hca-atlas-tracker/issues/724)) ([09846f7](https://github.com/clevercanary/hca-atlas-tracker/commit/09846f7e82d86dcf005774ac24436f0c21ff475e))

## [1.22.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.21.0...v1.22.0) (2025-07-21)


### Features

* delete validations for removed entry sheets and use ids instead of urls ([#716](https://github.com/clevercanary/hca-atlas-tracker/issues/716)) ([#718](https://github.com/clevercanary/hca-atlas-tracker/issues/718)) ([4a932af](https://github.com/clevercanary/hca-atlas-tracker/commit/4a932af5c86b8bc0c697b77bc2e806b72b2f7bee))


### Chores

* update findable-ui to latest v38.2.0 ([#692](https://github.com/clevercanary/hca-atlas-tracker/issues/692)) ([#703](https://github.com/clevercanary/hca-atlas-tracker/issues/703)) ([5f2a5c6](https://github.com/clevercanary/hca-atlas-tracker/commit/5f2a5c66c50e919f8c01548b6532951ff2684fb0))

## [1.21.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.20.1...v1.21.0) (2025-07-17)


### Features

* add sync button to entry sheet validation view ([#713](https://github.com/clevercanary/hca-atlas-tracker/issues/713)) ([#714](https://github.com/clevercanary/hca-atlas-tracker/issues/714)) ([3e82cb8](https://github.com/clevercanary/hca-atlas-tracker/commit/3e82cb8202bff9925b6d2783e358120b06c1c7d0))

## [1.20.1](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.20.0...v1.20.1) (2025-07-17)


### Bug Fixes

* delete associated entry sheet validations when source study is deleted ([#705](https://github.com/clevercanary/hca-atlas-tracker/issues/705)) ([#710](https://github.com/clevercanary/hca-atlas-tracker/issues/710)) ([456028f](https://github.com/clevercanary/hca-atlas-tracker/commit/456028ff5d4c266697a5878579a4911b6788c589))

## [1.20.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.19.0...v1.20.0) (2025-07-11)


### Features

* add cell value to entry sheet validation report ([#691](https://github.com/clevercanary/hca-atlas-tracker/issues/691)) ([#702](https://github.com/clevercanary/hca-atlas-tracker/issues/702)) ([ed53cb8](https://github.com/clevercanary/hca-atlas-tracker/commit/ed53cb82e38ef9d7c22c80a41e68842450bbe293))
* move sync metadata entry sheets button to the metadata entry sheets tab ([#696](https://github.com/clevercanary/hca-atlas-tracker/issues/696)) ([#701](https://github.com/clevercanary/hca-atlas-tracker/issues/701)) ([37030f5](https://github.com/clevercanary/hca-atlas-tracker/commit/37030f515ddc5d9107267a3ce9f9f50b73e0d68c))


### Bug Fixes

* show sheet related errors on error detail page ([#697](https://github.com/clevercanary/hca-atlas-tracker/issues/697)) ([#699](https://github.com/clevercanary/hca-atlas-tracker/issues/699)) ([d1a217e](https://github.com/clevercanary/hca-atlas-tracker/commit/d1a217e9f7f8955c95aa12d16ce86af0a5594ed5))

## [1.19.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.18.0...v1.19.0) (2025-07-09)


### Features

* add alert to metadata entry sheets ([#683](https://github.com/clevercanary/hca-atlas-tracker/issues/683)) ([#685](https://github.com/clevercanary/hca-atlas-tracker/issues/685)) ([07f6393](https://github.com/clevercanary/hca-atlas-tracker/commit/07f639358fa92aa4714438f93d2d380aebdff7c1))
* add api and placeholder button to fetch and save entry sheet validations ([#655](https://github.com/clevercanary/hca-atlas-tracker/issues/655)) ([#662](https://github.com/clevercanary/hca-atlas-tracker/issues/662)) ([f7b0212](https://github.com/clevercanary/hca-atlas-tracker/commit/f7b0212ce6c9a4d3ef26d6d23107bbe0c4839bf1))
* add api to get a full individual entry sheet validation ([#658](https://github.com/clevercanary/hca-atlas-tracker/issues/658)) ([#665](https://github.com/clevercanary/hca-atlas-tracker/issues/665)) ([e1a62d0](https://github.com/clevercanary/hca-atlas-tracker/commit/e1a62d03160e62ef9b18acdb86dd74649ecffdda))
* add api to get entry sheet validations of an atlas ([#656](https://github.com/clevercanary/hca-atlas-tracker/issues/656)) ([#664](https://github.com/clevercanary/hca-atlas-tracker/issues/664)) ([e695847](https://github.com/clevercanary/hca-atlas-tracker/commit/e695847ced9a5c1bfa7ce84748042e38aebd3c31))
* add api to update an individual entry sheet validation ([#686](https://github.com/clevercanary/hca-atlas-tracker/issues/686)) ([#688](https://github.com/clevercanary/hca-atlas-tracker/issues/688)) ([f2c5308](https://github.com/clevercanary/hca-atlas-tracker/commit/f2c5308e30db87d862375c457db432a1ca2dbe22))
* add count to metadata entry sheet tab ([#676](https://github.com/clevercanary/hca-atlas-tracker/issues/676)) ([#680](https://github.com/clevercanary/hca-atlas-tracker/issues/680)) ([18eb318](https://github.com/clevercanary/hca-atlas-tracker/commit/18eb3183c61ace79997c8375409156611465d3c4))
* add prod lambda url ([#693](https://github.com/clevercanary/hca-atlas-tracker/issues/693)) ([#694](https://github.com/clevercanary/hca-atlas-tracker/issues/694)) ([5e627e1](https://github.com/clevercanary/hca-atlas-tracker/commit/5e627e14d041e1ca53c5fead1701e88f3b5146bb))
* add source study publication strings to entry sheet validations returned from apis ([#666](https://github.com/clevercanary/hca-atlas-tracker/issues/666)) ([#667](https://github.com/clevercanary/hca-atlas-tracker/issues/667)) ([2aa5be5](https://github.com/clevercanary/hca-atlas-tracker/commit/2aa5be57e3e83bdd9bbf05822d82189fa7e1c081))
* add summary to metadata entry sheets ([#682](https://github.com/clevercanary/hca-atlas-tracker/issues/682)) ([#684](https://github.com/clevercanary/hca-atlas-tracker/issues/684)) ([47bded5](https://github.com/clevercanary/hca-atlas-tracker/commit/47bded5431de19ca6446c3d149af3f7f44757a4a))
* create validation report ui ([#659](https://github.com/clevercanary/hca-atlas-tracker/issues/659)) ([#681](https://github.com/clevercanary/hca-atlas-tracker/issues/681)) ([240d0f2](https://github.com/clevercanary/hca-atlas-tracker/commit/240d0f23fa01a5948c4db8f5329bd50bf8ad2795))
* entry sheet list (bare bonez) ([#657](https://github.com/clevercanary/hca-atlas-tracker/issues/657)) ([#671](https://github.com/clevercanary/hca-atlas-tracker/issues/671)) ([5def8b0](https://github.com/clevercanary/hca-atlas-tracker/commit/5def8b07233f24b2138e8c05205f99145faef3aa))
* return entry sheet validation count from atlas apis ([#678](https://github.com/clevercanary/hca-atlas-tracker/issues/678)) ([#679](https://github.com/clevercanary/hca-atlas-tracker/issues/679)) ([8202c9d](https://github.com/clevercanary/hca-atlas-tracker/commit/8202c9dd8d443f67b49b4abc17955033a14b7304))
* send bionetwork in validation tools requests ([#674](https://github.com/clevercanary/hca-atlas-tracker/issues/674)) ([#677](https://github.com/clevercanary/hca-atlas-tracker/issues/677)) ([3f1c0fd](https://github.com/clevercanary/hca-atlas-tracker/commit/3f1c0fdb1c2004843df18919df492272afa68d84))
* validate new entry sheets when a source study is updated ([#673](https://github.com/clevercanary/hca-atlas-tracker/issues/673)) ([#687](https://github.com/clevercanary/hca-atlas-tracker/issues/687)) ([3b1028d](https://github.com/clevercanary/hca-atlas-tracker/commit/3b1028d0166c75d8918803df4552918f92206ab4))
* validate shape of data received from validation tools api ([#668](https://github.com/clevercanary/hca-atlas-tracker/issues/668)) ([#675](https://github.com/clevercanary/hca-atlas-tracker/issues/675)) ([f39afcb](https://github.com/clevercanary/hca-atlas-tracker/commit/f39afcb5e5d2ec687548e0f1fd97d95f15970d7b))


### Chores

* update findable to 37.1.0 ([#669](https://github.com/clevercanary/hca-atlas-tracker/issues/669)) ([#670](https://github.com/clevercanary/hca-atlas-tracker/issues/670)) ([5b96af2](https://github.com/clevercanary/hca-atlas-tracker/commit/5b96af245aab025a20ec2d212cc5bacd4755e9a7))

## [1.18.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.17.1...v1.18.0) (2025-06-04)


### Features

* add atlas cap id field ([#648](https://github.com/clevercanary/hca-atlas-tracker/issues/648)) ([#660](https://github.com/clevercanary/hca-atlas-tracker/issues/660)) ([e7cc363](https://github.com/clevercanary/hca-atlas-tracker/commit/e7cc3639fa3bf8a5aac277c4d59d33b365fc25e5))


### Bug Fixes

* accept project urls for cap id rather than dataset urls ([#649](https://github.com/clevercanary/hca-atlas-tracker/issues/649)) ([#653](https://github.com/clevercanary/hca-atlas-tracker/issues/653)) ([862e5d6](https://github.com/clevercanary/hca-atlas-tracker/commit/862e5d6a70234d2ec0edb96fb0cc85c7f08baa93))


### Chores

* update saved cellxgene info ([#650](https://github.com/clevercanary/hca-atlas-tracker/issues/650)) ([#651](https://github.com/clevercanary/hca-atlas-tracker/issues/651)) ([33420cf](https://github.com/clevercanary/hca-atlas-tracker/commit/33420cf1589fb95fd9edee41b36a8258031d1690))

## [1.17.1](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.17.0...v1.17.1) (2025-05-07)


### Chores

* update cellxgene tier 1 statuses ([#644](https://github.com/clevercanary/hca-atlas-tracker/issues/644)) ([#645](https://github.com/clevercanary/hca-atlas-tracker/issues/645)) ([d9fdd9f](https://github.com/clevercanary/hca-atlas-tracker/commit/d9fdd9f63807ffbef5b5e689e551b8d91054c7a7))

## [1.17.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.16.0...v1.17.0) (2025-04-26)


### Features

* use `next-auth` for authentication ([#395](https://github.com/clevercanary/hca-atlas-tracker/issues/395)) ([#398](https://github.com/clevercanary/hca-atlas-tracker/issues/398)) ([8d679bf](https://github.com/clevercanary/hca-atlas-tracker/commit/8d679bf0cb641f7ed927b86185561e1ece1154fb))

## [1.16.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.15.0...v1.16.0) (2025-04-12)


### Features

* initial steps toward source study-focused source datasets ([#641](https://github.com/clevercanary/hca-atlas-tracker/issues/641)) ([#642](https://github.com/clevercanary/hca-atlas-tracker/issues/642)) ([daa0431](https://github.com/clevercanary/hca-atlas-tracker/commit/daa0431daaef31154c59b2bb51659b6af43a946b))
* swap order of source studies tab and source datasets tab ([#638](https://github.com/clevercanary/hca-atlas-tracker/issues/638)) ([#639](https://github.com/clevercanary/hca-atlas-tracker/issues/639)) ([39d8769](https://github.com/clevercanary/hca-atlas-tracker/commit/39d876945f80ee1afbc47a0f0436d26f8cac2889))

## [1.15.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.14.0...v1.15.0) (2025-04-09)


### Features

* allow adding any number of metadata spreadsheets to source studies ([#636](https://github.com/clevercanary/hca-atlas-tracker/issues/636)) ([#637](https://github.com/clevercanary/hca-atlas-tracker/issues/637)) ([e0d9dcc](https://github.com/clevercanary/hca-atlas-tracker/commit/e0d9dccb60b0b421560cc853302fca23cf7f4f83))


### Bug Fixes

* retain metadata spreadsheet info when cellxgene dataset is updated ([#629](https://github.com/clevercanary/hca-atlas-tracker/issues/629)) ([#634](https://github.com/clevercanary/hca-atlas-tracker/issues/634)) ([1f1b1a7](https://github.com/clevercanary/hca-atlas-tracker/commit/1f1b1a76769aba09228f209d547426b801157356))


### Chores

* delete unused `files-outdated` folder ([#622](https://github.com/clevercanary/hca-atlas-tracker/issues/622)) ([#632](https://github.com/clevercanary/hca-atlas-tracker/issues/632)) ([c4d64c6](https://github.com/clevercanary/hca-atlas-tracker/commit/c4d64c6b4cf79aeebc5e8b6f1b4a8ce420cbc7b1))

## [1.14.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.13.0...v1.14.0) (2025-03-25)


### Features

* save and display metadata spreadsheet titles for source datasets ([#625](https://github.com/clevercanary/hca-atlas-tracker/issues/625)) ([#630](https://github.com/clevercanary/hca-atlas-tracker/issues/630)) ([232216b](https://github.com/clevercanary/hca-atlas-tracker/commit/232216b53eb32bec7b6313a0137b7204262a8cfa))

## [1.13.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.12.0...v1.13.0) (2025-03-23)


### Features

* query, save, and display metadata specification sheet title in atlas form ([#602](https://github.com/clevercanary/hca-atlas-tracker/issues/602)) ([#624](https://github.com/clevercanary/hca-atlas-tracker/issues/624)) ([c973095](https://github.com/clevercanary/hca-atlas-tracker/commit/c973095c32f245cf0fa4e2961d2ab7b28b89f47f))


### Bug Fixes

* make next env vars available in the docker image ([#627](https://github.com/clevercanary/hca-atlas-tracker/issues/627)) ([#628](https://github.com/clevercanary/hca-atlas-tracker/issues/628)) ([1ac2f58](https://github.com/clevercanary/hca-atlas-tracker/commit/1ac2f5846cb07ddf15e2766059b6a1e4811d6170))
* rename google service account environment variable ([#602](https://github.com/clevercanary/hca-atlas-tracker/issues/602)) ([#626](https://github.com/clevercanary/hca-atlas-tracker/issues/626)) ([57103c2](https://github.com/clevercanary/hca-atlas-tracker/commit/57103c284423690e035d36323d936d7dc6a181ef))


### Chores

* update finable-ui to latest v22.0.0 ([#617](https://github.com/clevercanary/hca-atlas-tracker/issues/617)) ([#618](https://github.com/clevercanary/hca-atlas-tracker/issues/618)) ([f2af3ec](https://github.com/clevercanary/hca-atlas-tracker/commit/f2af3ec364f158cdee2645f5a0d8646810e10200))

## [1.12.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.11.1...v1.12.0) (2025-03-10)


### Features

* add feedback link ([#605](https://github.com/clevercanary/hca-atlas-tracker/issues/605)) ([#615](https://github.com/clevercanary/hca-atlas-tracker/issues/615)) ([2cd8a9d](https://github.com/clevercanary/hca-atlas-tracker/commit/2cd8a9da371ba8780c5e9539acfcd33fc196dea7))


### Chores

* added feedback template ([b0637e9](https://github.com/clevercanary/hca-atlas-tracker/commit/b0637e9ae3424626ce9eb24b9039f022f87d3a5a))
* added feedback template [#604](https://github.com/clevercanary/hca-atlas-tracker/issues/604) ([#606](https://github.com/clevercanary/hca-atlas-tracker/issues/606)) ([b0637e9](https://github.com/clevercanary/hca-atlas-tracker/commit/b0637e9ae3424626ce9eb24b9039f022f87d3a5a))


### Code Refactoring

* don't load entire file when reading cellxgene datasets ([#610](https://github.com/clevercanary/hca-atlas-tracker/issues/610)) ([#614](https://github.com/clevercanary/hca-atlas-tracker/issues/614)) ([47fb459](https://github.com/clevercanary/hca-atlas-tracker/commit/47fb459e7f5afa1edf024e97038c18f992ab9889))

## [1.11.1](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.11.0...v1.11.1) (2025-03-07)


### Content

* update tier 1 metadata info ([#610](https://github.com/clevercanary/hca-atlas-tracker/issues/610)) ([#611](https://github.com/clevercanary/hca-atlas-tracker/issues/611)) ([d0414a4](https://github.com/clevercanary/hca-atlas-tracker/commit/d0414a4765423e8cb13bd58d651957fd06c903c9))

## [1.11.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.10.1...v1.11.0) (2025-03-05)


### Features

* add tier 1 metadata status to source study dataset list ([#608](https://github.com/clevercanary/hca-atlas-tracker/issues/608)) ([#609](https://github.com/clevercanary/hca-atlas-tracker/issues/609)) ([d75ecf6](https://github.com/clevercanary/hca-atlas-tracker/commit/d75ecf6528c3c46fad13adf44c0e403a3505f4b9))
* add tier 1 metadata task and incorporate into source study status ([#591](https://github.com/clevercanary/hca-atlas-tracker/issues/591)) ([#603](https://github.com/clevercanary/hca-atlas-tracker/issues/603)) ([618c711](https://github.com/clevercanary/hca-atlas-tracker/commit/618c711f2786c3fa93c5912d4dff1597e9811428))

## [1.10.1](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.10.0...v1.10.1) (2025-02-27)


### Bug Fixes

* enable actual code for source study hca status ([#599](https://github.com/clevercanary/hca-atlas-tracker/issues/599)) ([#600](https://github.com/clevercanary/hca-atlas-tracker/issues/600)) ([5dd9773](https://github.com/clevercanary/hca-atlas-tracker/commit/5dd97736a9bc216aa7dd79837e2ef1db7fa7d1b7))

## [1.10.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.9.0...v1.10.0) (2025-02-26)


### Features

* update source study hca status labels ([#596](https://github.com/clevercanary/hca-atlas-tracker/issues/596)) ([#597](https://github.com/clevercanary/hca-atlas-tracker/issues/597)) ([690da4d](https://github.com/clevercanary/hca-atlas-tracker/commit/690da4d928e21391f5706ba6a266a16219587a3e))

## [1.9.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.8.0...v1.9.0) (2025-02-26)


### Features

* incorporate primary data status into source study hca status ([#589](https://github.com/clevercanary/hca-atlas-tracker/issues/589)) ([#593](https://github.com/clevercanary/hca-atlas-tracker/issues/593)) ([bec78d7](https://github.com/clevercanary/hca-atlas-tracker/commit/bec78d7b5dea415751fe5e4d0a56214c22a2b5ae))
* instructions section for source studies and source dataset ([#594](https://github.com/clevercanary/hca-atlas-tracker/issues/594)) ([#595](https://github.com/clevercanary/hca-atlas-tracker/issues/595)) ([858d9f3](https://github.com/clevercanary/hca-atlas-tracker/commit/858d9f385e722ee2c2794e1422366d75f646d7b7))
* update atlas source study and source dataset tables ([#588](https://github.com/clevercanary/hca-atlas-tracker/issues/588)) ([#592](https://github.com/clevercanary/hca-atlas-tracker/issues/592)) ([0b4e65d](https://github.com/clevercanary/hca-atlas-tracker/commit/0b4e65ddd8e19d20798c4debd32456beda012232))
* update name and content of source study datasets column for more clarity ([#585](https://github.com/clevercanary/hca-atlas-tracker/issues/585)) ([#586](https://github.com/clevercanary/hca-atlas-tracker/issues/586)) ([9494fd1](https://github.com/clevercanary/hca-atlas-tracker/commit/9494fd1bd9ecac518839dec46f12e5156ee1b9c6))

## [1.8.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.7.0...v1.8.0) (2025-02-05)


### Features

* add metadata correctness report to atlas detail ([#578](https://github.com/clevercanary/hca-atlas-tracker/issues/578)) ([#583](https://github.com/clevercanary/hca-atlas-tracker/issues/583)) ([988a3e9](https://github.com/clevercanary/hca-atlas-tracker/commit/988a3e9b1607f2accdc054e082d158843ba0f2da))

## [1.7.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.6.0...v1.7.0) (2025-02-01)


### Features

* add related entity urls to all validations and show "N/A" when unavailable ([#572](https://github.com/clevercanary/hca-atlas-tracker/issues/572)) ([#574](https://github.com/clevercanary/hca-atlas-tracker/issues/574)) ([8cac093](https://github.com/clevercanary/hca-atlas-tracker/commit/8cac0930928ea047aad8cd63c48589c32c85cbc1))
* add resource column to reports table ([#571](https://github.com/clevercanary/hca-atlas-tracker/issues/571)) ([#577](https://github.com/clevercanary/hca-atlas-tracker/issues/577)) ([71abba3](https://github.com/clevercanary/hca-atlas-tracker/commit/71abba34409e739cbf0f3a65671cd1144b4b5999))


### Bug Fixes

* update findable ui to resolve issue with tsv export ([#573](https://github.com/clevercanary/hca-atlas-tracker/issues/573)) ([#576](https://github.com/clevercanary/hca-atlas-tracker/issues/576)) ([e8ffdd1](https://github.com/clevercanary/hca-atlas-tracker/commit/e8ffdd147116ac521fbe82338b1979d04f9f0b3d))

## [1.6.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.5.0...v1.6.0) (2025-01-22)


### Features

* rename atlas completed status to oc endorsed ([#564](https://github.com/clevercanary/hca-atlas-tracker/issues/564)) ([#566](https://github.com/clevercanary/hca-atlas-tracker/issues/566)) ([f3f3689](https://github.com/clevercanary/hca-atlas-tracker/commit/f3f3689e7af3ab3a604f782eeba0f1dce4752579))
* rename atlas status value `COMPLETE` to `OC_ENDORSED` ([#569](https://github.com/clevercanary/hca-atlas-tracker/issues/569)) ([#570](https://github.com/clevercanary/hca-atlas-tracker/issues/570)) ([ff95529](https://github.com/clevercanary/hca-atlas-tracker/commit/ff9552990a900a5349a8218bed49337e10899d92))
* update golden sheet and integration lead columns ([#565](https://github.com/clevercanary/hca-atlas-tracker/issues/565)) ([#568](https://github.com/clevercanary/hca-atlas-tracker/issues/568)) ([16be36c](https://github.com/clevercanary/hca-atlas-tracker/commit/16be36cadba14710d83d123c5c0425ed68365361))

## [1.5.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.4.0...v1.5.0) (2025-01-22)


### Features

* add metadata spreadsheet link to atlas source dataset list ([#549](https://github.com/clevercanary/hca-atlas-tracker/issues/549)) ([#559](https://github.com/clevercanary/hca-atlas-tracker/issues/559)) ([250f6a9](https://github.com/clevercanary/hca-atlas-tracker/commit/250f6a9bb7bd9d0bc15881e329e20def69d741c1))
* added metadata specification column ([#547](https://github.com/clevercanary/hca-atlas-tracker/issues/547)) ([#552](https://github.com/clevercanary/hca-atlas-tracker/issues/552)) ([2bd70a0](https://github.com/clevercanary/hca-atlas-tracker/commit/2bd70a06c35d47c8974c3c5188bd0d6a7218c529))
* added roadmap grouping by default ([#546](https://github.com/clevercanary/hca-atlas-tracker/issues/546)) ([#551](https://github.com/clevercanary/hca-atlas-tracker/issues/551)) ([f250dd1](https://github.com/clevercanary/hca-atlas-tracker/commit/f250dd1607cc5ec43d3a3c236b109fb65012bec5))


### Chores

* renamed metadata spreadsheet ([#550](https://github.com/clevercanary/hca-atlas-tracker/issues/550)) ([#556](https://github.com/clevercanary/hca-atlas-tracker/issues/556)) ([66b46f1](https://github.com/clevercanary/hca-atlas-tracker/commit/66b46f14108d2e8ff923812627a9b37b030f6e05))

## [1.4.0](https://github.com/clevercanary/hca-atlas-tracker/compare/v1.3.0...v1.4.0) (2025-01-18)


### Features

* removed confidentiality notice ([#548](https://github.com/clevercanary/hca-atlas-tracker/issues/548)) ([#555](https://github.com/clevercanary/hca-atlas-tracker/issues/555)) ([b96119a](https://github.com/clevercanary/hca-atlas-tracker/commit/b96119a4d7fcb0099c4fc184be9274fc97e45d69))


### Build System

* checkout full history and tags during build ([#523](https://github.com/clevercanary/hca-atlas-tracker/issues/523)) ([#558](https://github.com/clevercanary/hca-atlas-tracker/issues/558)) ([2e34390](https://github.com/clevercanary/hca-atlas-tracker/commit/2e343907f5f4e013fefd381bb332828f69ca2f8f))

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
