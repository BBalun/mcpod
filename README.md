# mCPod 2.0 - On-line database of photometric observations of mCP stars

This is a reimplementation of the mCPod application for the Department of Theoretical Physics and Astrophysics of Faculty of Science of Masaryk University. Original application was written in 2007 using outdated technologies and is missing some wanted feature.

The application is available at https://mcpod.physics.muni.cz/

## First deployment 
- `npm run build`
- `sudo npm start` 
- `npm run migrate`
- `npm run seed`

## Other useful commands
Restart the application:
- `npm run stop`
- `sudo npm start`

Reseed the application's database after the source data was updated:
- First make sure that app is running. If it is not start is using `sudo npm start`
- `npm run seed`


## Notes
- Always run start script (`npm run start`) as a super user. This is because container would be force stopped after logout.