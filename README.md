# RIU-Frontend-Emilio-Chiarlone
Technical challenge for the Angular SR position requested by RIU.

## Description
SPA developed in Angular 19 (latest LTS version) that allows complete CRUD on a list of superheroes, including search by name, editing, deletion, and pagination. 
No backend to send/receive data, everything is stored in memory through HeroesService.
High code quality standards in its structure and testing are a priority, following the best practices I know and have used. 

## Technologies used
1. Angular 19 - Frontend framework
2. TypeScript - Language
3. Angular Material - UI Components
4. Jasmine / Karma - Unit testing
5. Docker - Container
6. Nginx - Web server
7. [NgRx SignalStore](https://ngrx.io/guide/signals/signal-store) - State management

## Project installation guide
1. git clone https://github.com/emiliochiarlone/RIU-Frontend-Emilio-Chiarlone.git
2. cd RIU-Frontend-Emilio-Chiarlone
3. cd superhero-app
3. npm install -g @angular/cli (if Angular is not installed)
4. npm install
5. ng serve

## Docker - multi-stage build (Nginx)
**Requirements:** Docker Desktop installed and running.
1. npm run docker:build
2. npm run docker:run

## Other useful commands
1. Unit tests: ng test
2. Build: ng build (result in /dist)


## Developer notes
1. There are methods and utilities that in a real project should be in a separate service/pipe, but for reasons of time and complexity of the app, this was avoided (for example, snackbar messages encapsulated in MessageService, capitalizeFirstLetter in pipe/utility service, localstorage management encapsulated in service, among others).
2. SCSS Mobile First nested and sorted alphabetically.
3. HTTP requests are calling a mock API so that the interceptor can receive them and manage the loading spinner.


**Developed by:** Emilio Chiarlone  
**LinkedIn:** [Emilio Chiarlone](https://www.linkedin.com/in/emilio-chiarlone-7ba74a123)

**Desarrollado por:** Emilio Chiarlone  
**LinkedIn:** [Emilio Chiarlone](https://www.linkedin.com/in/emilio-chiarlone-7ba74a123)
