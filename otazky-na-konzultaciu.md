- systemy su definovane v `systems.xml`, chceme ho pouzivat nadalej?
  - je v plane pridavanie dalsich systemov alebo filterov?
  - chceme nechat format nazvov (title) jednotlivych filtrov v tom psudo HTML?

- hd cisla - su unikatne? ma ich kazda hviezda?
  
- filtrovanie podla JD - bolo spominane, ze mozno netreba - tak treba/netreba?
  - co to je za format to JD?
  
- ukladanie dat v URL ako query parametre?

- exportovanie do .txt a .png 
  - aj do .eps?
  
- chceme nechavat queries
  - pre vsetky hviezdy a vsetky filtre
  - pre vsetky hviezdy a jeden filter
  - pre jednu hviezdu  a vsetky filtre
  
- chceme nechat moznost filtrovat v grafe

- elementy - obsahuje len epoch a period

- [articles result](https://mcpod.physics.muni.cz/article_result.php) 
  - dataset statistics + get statistics => nefunguju - treba to opravit? ako by to malo fungovat?

- cheme sa vediet v grafe pohybovat (priblizovat a posuvat)?


### Odpovede
- systems.xml ostava, displayName (title) moze byt v texu
- hd cislo nema kazda hviezda - iba tie najjasnejsie
  - mozno existuje nejaky globalny id pre kazdu hviezdu, 
- JD - len ma offset 2_400_000
- export do .eps by bol fajn, pretoze sa to vraj lepsie zobrazuje v latexu
- queries pre vsetky hviezdy/filtre chceme nechavat, lebo to sluzi ako data dump
- elementy - su naozaj len na predvyplnenie epoch a ... v phase calculation
- database statistics - by nemalo existovat
- get statistics - len filtrovanie dat v pozorovanie.csv podla hd number a article id

SIMBAD - pouzivat na vyhladavanie hd cisla

-----------------------------------------------------------------------------------------------------------------------

## 10.3.2023 - konzultacia
Ukazat
- JSON subor so systemami
- vyhladavanie podla SIMBADu
- graf s phased light curve data
- filtrovanie podla Julian date
- dotahovanie a upravovanie phase a period

Pojmy na vyjasnenie
- efermidity - co to je?
- katalog - vseobecne a potom ten nas txt subor
  - co to predstavuje?
  - moze byt jedna hviezda viac krat v jedno katalogu?
- pozoravania - ten txt subor
  - co predstavuje
  - aky je rozdiel medzi katalogom

Otazky:
- interaktivní vykreslování dat (světelných křivek)
  - z jiných dostupných on-line zdrojů (např. katalogy Hipparcos a Tycho).

- co su efemeridy 
  - preco pouzivat https://www.aavso.org/vsx/index.php
  - nestaci VizieR?

- https://mcpod.physics.muni.cz/article_result.php
  - tlacidlo submit query - co by malo robit

- poradit sa ako robit data export - pre fotky (png) a ako pre textove subory (txt/csv)
  - mozu byt data namiesto txt v csv? - to iste, ale obsahovalo by to header 

Poznamky:
oznacovanie jednotlivych systemov 
+ jednotlive systemy

https://cdsarc.cds.unistra.fr/viz-bin/vizExec/Vgraph?I/239/26742&4767%20%201406%201
http://cdsarc.cds.unistra.fr/viz-bin/vizExec/Vgraph?I/239/26742&4767%20%201406%201

efemerida - phase v phased form
 - vypocet phase v druhom grafe

epoch - je ichv viacero - je edno ktore zoberieme
  - ak vyjde zapocne cislo pripocitame +1

https://cdsarc.cds.unistra.fr/viz-bin/vizExec/Vgraph?cat=I%2F239%2F.%2F2243&-graph=2266-725-1%09&P=0&-graph=-Y%09mag&-x0=&-x1=&--bitmap=600x600&-y0=6.7&-y1=7.2&-y2=-

data z toho dotahovat a pridavat k nasim len aj su zaskrtnute filtre z hipparcos systemu

## Otazky na dalsiu konzultaciu
- reference table - ak popis bude calculated on the fly, mohli by sme ju zjednodusit? Bude tam potom menej zaznamov v danej tabulke
  - tieto data su aj v subore `pozorovani` stlpec `pocet` (stvrty stlpec)
  - subor `reference` stlpec `s_hvezda` - co oznacuje?
    - nemala by byt tato informacia skor v subore `pozorovani`
- ako pracovat s datami z externych zdrojov - efemeridy (VSX) a data (Hip + Tyc)
  - stiahnut si ich vzdy ked ich uzivatel vyziada, alebo ich ukladat do nasej db?
    - predpokladam, ze tie data sa uz nikdy menit nebudu. Efemeridy sa ale menia v case vsak?
  - ak ich ukladat, tak mozem zmenit data v tabulkach, aby pouzivali cely identifikator hviezdy ako ich meno?
    - stlpec nebude `hdNumber` ale `starId` a hodnoty budu napr.: `HD123`, `HIP123` alebo `TYC-123-123-1`
    - alebo to potom riesit cez tie fiktivne hd cisla a mat dalsiu tabulku co bude sluzit na mapovanie fiktivnych na ine druhy identifikatorov

### Co ukazat na konzultacii
- moznost oznacovat cele systemy
- moznost odstranit vsetky filtre
- reverse magnitude na phased light curve charte
- go to references button
- get statistics
- selecte some references and display chart

bibcode `&` symbol problem - nefunguje link napriklad pre ref 0001

odstranit data s referenciou 0000 - t.j. tycho - ten bude dotahovany online
fiktivne HD cislo gaia - dava to zmysel? 
- mozno radsej len pridat vsade prefix HD
- namiesto fiktivnych HD cisel budeme pouzivat nieco nase - bud obycajne cisla, alebo vlastny prefix
  - ak symbad nenajde identifikator (HD, HIP a TYC cisla nebudu existivat), tak ho aj tak skusime vyhladat v nasel db

prefix hd v katalogu

---

### Otazky na konzultaciu 20.3.2023
- vieme stiahnut data z hipparcos a tycho katalogov?
  - tycho chyba jedna cast
- ak sa budu data dotahovat z online katalogov, co sa ma zobrazovat na references page a dalej na get statistics (observations) page?
- bavili sme sa o odstranovani dat z reference s id 0000 - tycho catalog
  - z ktorych vsetkych suborov odstranit zaznamy s ref 0000? - katalog, reference, pozorovani
- vyhladavanie zaznamov postup:
  - najdeme vsetky identifikatory
  - vyhladame vsetky identifikatory v db
  - zobrazime data v UI
  - **Otazka:** mozem upravit subor pozorovanie, aby stlpec hd cislo obsahoval aj prefix HD?
  - (takto budete moct do katalogu pridavat info s pouzitim lubovolneho identifikatoru)

- okrem data exportu a dotahovania dat z online katalogov, chyba tomu este nieco?
  - je zobrazovanie dat dostatocne interaktivne?

### poznamky z konzultacie 20.3.2023
- cele katalogy nevie kde by sa dali stiahnut a podla neho to nie je dobry napad
- data vymazat z reference a katalog, pozorovani nechat, v elementy, tam nic nie je
- interaktivny graf - moznost zoom casti grafu a export potom len tych dak, ktore su zobrazene 
- vsetko dotahovat online 
  - datam z tycha vytvorit specialnu referenciu oznacujucu iba tycho
  - rovnako pre data z hipparcosu

- neviem k comu je toto:
  lambda je dana
  amlit_eff = sa dopocitava

---

## co ukazat
- dotahovanie dat z externeho catalogu funguje 
  - ako to funguje - pri vyhladavani sa cisti HIP a TYC cislo zo SIMBADU
    - SIMBAD oid sa pouziva na identifikovanie objektov u nas v DB na pozadi
    - vo vstupnom subore sa lubovolny identifikator pocas seedovania zameni za SIMBAD oid
    - pri prvom vyhladani sa zarovane nacitaju data z externych katalogov
    - data sa upravia a ulozia sa potrebne zaznamy do tabulike catalog, references a observations
- nova kniznica na vykreslovanie grafov - stara bola pomala s datami s externych zdrojov
- stahovanie obrazkov - png a svg
- dotahuje sa aj mainId zo SIMBADu


- podstatne otazky
  - chyby v suboroch
  - reference page - moze byt starId ako stlpec alebo to nahradzovat s mainId zo SIMBADu
  - export csv - co vsetko by tam malo byt za stplce
  - exportovanie dat z viacerych hviezd - staci vsetky alebo si vediet vybrat ktore

### otazky na dalsiu konzultaciu
- data/input/katalog.csv
  - line 232756 - mag_err value = `1 0.004` - is it 0 or 10?
  - only 0
- data/input/reference_with_errors.csv
  - line 126, 127 - same starId and referenceId
  - line 148, 149 - same starId and referenceId
  - line 202, 203 - same starId and referenceId
  - line 402, 403 - same starId and referenceId
  - line 409, 428 - same starId and referenceId
  - line 455, 456, 457 - same starId and referenceId
  - line 469, 470 - same starId and referenceId
  - line 636, 637 - same starId and referenceId
  - send email with all data and where the duplicate line 
- data/input/pozorovani - starId, filter, referenceId are not unique

- reference page - what should be displayed in **Star HD No. column**?
  - primarne hd cislo potom to je jedno

- export data for multiple stars
  - what data formats should be supported - is csv enough?
  - can it be separate page?

- export csv data from star page
  - what columns should exported data contain? - is filter, mag and 

---

### dalsie otazky
- export dat na star page (CSV, PNG a SVG format) ma byt iba data co su prave na grafe, alebo vsetky data


##
- subor reference - com HD num field - "HD" - je to chyba v subore

- vratenie naspat posledny stlpec na stranke reference - nie je mozne - bude obsahovat zle data, pretoze mi data dotahujeme aj z externych katalogov
 
- spravit (reference, hd cislo) unikatne v reference table (pridat unique constraint pre reference table)
  - upravenim stlpca reference na x.1 a x.2
    - priklad - rovnake riadky v tvare (123, 456, ...) by sme rozdelili na (123.1., 456) a (123.2, 456)

- uknown filter name pri grafe 
  - nezname filtre : 11, 72, 77
  
- mame celkom dost problemov s integritou dat (nezname filtre, neunikatne referencie a pozorovani)
  - aby sme zabranili takymto problemom v buducnosti, tak vieme datovy model znormalizovat
  - zaberie to dost casu a bude treba opravovat dalsie chyby co najdeme


<!-- - filtrovanie referencii - ako by to malo fungovat
  - teraz berieme data z reference suboru, ten neobsahuje info o filtroch
  - selectneme unikatne referenceIDs z catalog table podla StarID a filterov a tieto referenceIDs pouzijeme na select z reference table
  -  -->
-  