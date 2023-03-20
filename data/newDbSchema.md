Ephemeris
starID - string
epoch - decimal
period - decimal

References
referenceId - string (Note: it is not unique - combination of referenceId and starId is uniques)
starId - string
author - string (Note: also can be called name of a reference)
bibcode - string
referenceStarIds - string (Note: this is a list of star ids as a string)

Observation
starId - string
lambdaEff - decimal / integer?
filter - string
referenceId - string
magAverage - decimal
magError - decimal
stdError - decimal
amplitudeEff - decimal

Catalog
starId - string
date - decimal
magnitude - decimal
magError - decimal
filter - string
referenceId - string

Measurement (materialized view calculated on each db update)
starId - string
referenceId - string
filter - string
count - integer
