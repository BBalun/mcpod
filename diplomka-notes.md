## query data from SIMBAD
- https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=sirius&submit=SIMBAD+search
- using TAP to write any query
  - https://simbad.u-strasbg.fr/simbad/sim-tap
- Queries for finding all identifiers using one of the identifiers
  - SELECT ident.oidref, id FROM ident JOIN
        (SELECT ident.oidref
        FROM basic JOIN ident ON oidref = oid
        WHERE id = 'HD48915') AS temp ON temp.oidref = ident.oidref
  - SELECT * FROM ident WHERE oidref IN 
        (SELECT ident.oidref
        FROM basic JOIN ident ON oidref = oid
        WHERE id = 'HD48915')
- https://simbad.u-strasbg.fr/simbad/tap/help/adqlHelp.html
  - How is SIMBAD able do find the start only by using unformatted identifier 
    - 10. Simbad specific features (part of a document found on URL above)
- TAP documentation
  - https://www.ivoa.net/documents/TAP/
  - https://www.ivoa.net/documents/TAP/20190927/REC-TAP-1.1.pdf
  - it is using query language based on SQL - ADQL 
- python package for simbad queries
  - https://astroquery.readthedocs.io/en/latest/simbad/simbad.html
- https://simbad.cds.unistra.fr/guide/sim-url.htx
  - SIMBAD documentation
  - https://simbad.cds.unistra.fr/guide/sim-url.htx
  - example: https://simbad.u-strasbg.fr/simbad/sim-id?Ident=sirius&output.format=ASCII
- Fetch HD numbers
```javascript
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    REQUEST: 'doQuery',
    PHASE: 'RUN',
    FORMAT: 'JSON',
    LANG: 'ADQL',
    query: 'SELECT * FROM ident WHERE oidref IN  (SELECT ident.oidref FROM basic JOIN ident ON oidref = oid WHERE id = \'sirius\')'
  })
};

fetch('http://simbad.u-strasbg.fr/simbad/sim-tap/sync', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
```

## Libraries for charts
- https://www.chartjs.org/
- https://nivo.rocks/
- D3.js - too low level 
- https://plotly.com/javascript/

## Convert Tex into HTML
- KeTex - https://www.npmjs.com/package/@matejmazur/react-katex


## Data from Hip and Tyc
- https://cdsarc.cds.unistra.fr/viz-bin/vizExec/Vgraph?I/239/${hipNumber}&${tycNumber}
  - both hipNumber and tycNumber are without they name prefix
  - example: https://cdsarc.cds.unistra.fr/viz-bin/nph-Plot/Vgraph/txt?I/239/./26742&4767-1406-1&P=0&-Y&mag&-y&-&-&-
    - I/239 - The Hipparcos and Tycho Catalogues (ESA 1997)
    - 26742 - HIP
    - 4767-1406-1 - TYC
    - other - idk
- `# m = -3` -> Hp
- `# m = -2` -> Bt
- first part -> Vt

