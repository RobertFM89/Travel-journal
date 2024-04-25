# Travel Journal

## Historias de Usuario o User Story

- [x] Como usuario anonimo puedo REGISTRARME.
    - [x] POST /sign-up -> username, email, password, avatar? -> ???
    - [ ] POST /validate-register -> codigo -> *exito o fallo*

- [x] Como usuario resgistrado puedo LOGUEARME
    - [x] POST /sign-in -> username o email y contraseña -> *exito o fallo*

- [x] Como usuario anonimo puedo ver TODAS las PUBLICACIONES
    - [x] GET /posts -> NULL -> posts[]

- [ ] Como usuario anonimo puedo ver UNA PUBLICACION
    - [ ] GET /posts/id_post -> NULL -> post

- [ ] Como usuario anonimo puedo ver la NUBE DE TAGS 
    - [ ] GET /tags -> NULL -> tags[]

- [x] Como usuario registrado puedo CREAR una publicacion
    - [ ] POST /posts -> title, description, userId (token) -> id_post
    - [ ] POST /posts/:id_post/media -> media -> ???

- [ ] Como usuario registrado puedo MODIFICAR LA VISIBILIDAD de una publicacion
    - [ ] PUT /posts/:id_post/visible -> NULL -> *exito o fallo*

- [x] Como usuario regisrado puedo EDITAR una publicacion propia
    - [ ] PATCH /posts/:id_post -> title?, description? -> *exito o fallo* 
    - [ ] DELETE /posts/:id_post/media/:id_media -> NULL -> *exito o fallo*
    - [ ] POST /posts/:id_post/media/:id_media -> media: {url : string} -> *exito o fallo*

- [x] Como usuario registrado puedo BORRAR una publicacion propia
    - [ ] DELETE /posts/:id_post -> NULL -> *exito o fallo*

- [x] Como usuario registrado puedo COMENTAR una publicacion
    - [ ] POST /posts/:id_post/comments

- [x] Como usuario registrado puedo EDITAR un comentario propio
    - [ ] PUT /posts/:id_post/comments/:id_comment

- [x] Como usuario registrado puedo BORRAR un comentario propio
    - [ ] DELETE /posts/:id_post/comments/:id_comment

- [ ] Como usuario registrado puedo VOTAR un post
    - [ ] GET /posts/:id_post/vote/:voteType

- [ ] Como usuario registrado puedo VER el perfil propio y de otro usuario registrado
    - [ ] GET /users/:id_user

- [ ] Como usuario registrado puedo EDITAR el perfil propio
    - [ ] PUT /users/:id_user

- [ ] Como usuario admin puedo VER TODOS los usuarios
    - [ ] GET /users

- [ ] Como usuario admin puedo BORRAR un post de otro usuario
    - [ ] DELETE /users/:id_user/posts/:id_post

- [ ] Como usuario admin puedo DESHABILITAR otro usuario
    - [ ] POST /users/:id_user/disabled 