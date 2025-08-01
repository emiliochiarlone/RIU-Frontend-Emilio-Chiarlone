# RIU-Frontend-Emilio-Chiarlone
Challenge Técnico para la posición Angular SR solicitada por RIU.

## Descripción
SPA desarrollada en Angular 19 (última versión LTS) que permite realizar un CRUD completo sobre una lista de superhéroes, incluyendo búsqueda por nombre, edición, eliminación, y paginación. 
Sin backend para enviar/recibir datos, todo se guarda en memoria a través de HeroesService.
Son prioridad los altos estándares de calidad de código en su estructura y testing siguiendo las mejores prácticas que conozco y he utilizado. 

## Tecnologias utilizadas
1. Angular 19 - Framework frontend
2. TypeScript - Lenguaje
3. Angular Material - UI Components
4. Jasmine / Karma - Unit testing
5. Docker - Container
6. Nginx - Servidor web

## Guía de instalación del proyecto
1. git clone https://github.com/emiliochiarlone/RIU-Frontend-Emilio-Chiarlone.git
2. cd RIU-Frontend-Emilio-Chiarlone
3. cd superhero-app
3. npm install -g @angular/cli (en caso de no tener instalado Angular)
4. npm install
5. ng serve

## Docker - multi-stage build (Nginx)
**Requisitos:** Docker Desktop instalado y ejecutándose.
1. npm run docker:build
2. npm run docker:run

## Otros comandos útiles
1. Tests unitarios: ng test
2. Build: ng build (resultado en /dist)

## Aclaraciones
1. Los tests no solicitados en las rúbricas fueron obviados.
2. Hay métodos y utilidades que en un proyecto real deben estar en un servicio/pipe aparte pero por razones de tiempo y complejidad de la app fue evitado (por ejemplo, mensajes snackbar encapsulado en MessageService, capitalizeFirstLetter en pipe/servicio de utilidad, almacenamiento en localstorage encapsulado en servicio, entre otros).
3. SCSS Mobile First anidado y ordenado alfabéticamente.
4. Las solicitudes HTTP están llamando a una API mock para que el interceptor las reciba y así gestionar el spinner de carga.

superhero-app/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 core/          # Services, Models, Interceptors, Utils
│   │   ├── 📁 heroes/        # Feature: Hero List + Hero Form (CRUD)
│   │   ├── 📁 shared/        # Componentes reutilizables
│   │   ├── app.component.
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │   
│   ├── 📁 assets/            # Imágenes


**Desarrollado por:** Emilio Chiarlone  
**LinkedIn:** [Emilio Chiarlone](https://www.linkedin.com/in/emilio-chiarlone-7ba74a123)