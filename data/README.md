# Data directory
This directory contains 2 subdirectories: public and source

## Public
Contains files that are served by nginx web server. 

Files `contact.html`, `home.html` can be used for content management of home and contact page. The file `content.css` can be used to provide styling to these pages. (Side note: the content of the rest of a pages cannot be managed, it is hardcoded in the React app located inside the project's root `frontend` directory)

Any files placed into this directory will be available at the route `/{name_of_the_file}`

## Data 
Contains data files. File `statistics.json` is automatically generated during database seeding. It contains information about number of stars and measurements the database contains. The application updates the database with data loaded from external catalogues, but this data should not be part of the database statistics. To avoid this issue, as a part of a seeding process, the number of measurements and stars contained in data files is calculated and saved into the `statistics.json` file.