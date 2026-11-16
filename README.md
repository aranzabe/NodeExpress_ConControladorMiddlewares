# Ejemplo con controlador y middleware

Este ejemplo parte de una API REST básica con Express y la reorganiza aplicando el patrón **Controlador** y el uso de **middlewares**, para separar responsabilidades:

- **`database/`** → simula el acceso a datos (nuestro "modelo").
- **`controllers/`** → contiene la lógica de cada ruta (qué hacer cuando llega una petición).
- **`middleware/`** → contiene funciones que se ejecutan **antes** de llegar al controlador (validaciones, comprobaciones, etc.).
- **`app.js`** → solo se encarga de levantar el servidor y definir las rutas, delegando el trabajo a controladores y middlewares.

## Estructura del proyecto

```
├── app.js
├── controllers/
│   └── MiControlador.js
├── middleware/
│   └── middlewares.js
├── database/
│   └── database.js
├── Node inicial.postman_collection.json
├── package.json
└── README.md
```

## 1. El "modelo": `database/database.js`

Simula una base de datos en memoria mediante un array. Expone funciones para consultar y modificar los valores:

```jsx
let valores = [1,2,3,4,5]

export const addValue = (valor) => {
    valores.push(valor);
}

export const addValueAt = (nuevoValor,i) => {
    valores.splice(i, 0, nuevoValor);
}

export const getValues = () => {
    return valores;
}

export const getValue = (i) => {
    return valores[i];
}

export const removeValueAt = (i) => {
    valores.splice(i, 1);
}

export const updateValueAt = (i, p) => {
    valores[i] = p;
}

export const size = () => {
    return valores.length
}
```

> ⚠️ Al ser un array en memoria, los datos se reinician cada vez que reiniciamos el servidor.

## 2. El controlador: `controllers/MiControlador.js`

Un **controlador** agrupa las funciones que atienden cada petición (el código que antes estaba directamente dentro de las rutas en `app.js`). Cada función recibe `req` y `res`, igual que antes, pero ahora viven fuera del archivo principal:

```jsx
import { addValue,
    addValueAt,
    getValue,
    getValues,
    removeValueAt,
    updateValueAt } from '../database/database.js'


const controlador = {
    funGet : (req,res) => {
        res.status(200).json({'msg' : 'Gestión del vector', 'valores' : getValues()})
    },
    funGetAt: (req, res) => {
        const indice = parseInt(req.params.id, 10);

        res.status(200).json({
            'pos': indice,
            'valor': getValue(indice)
        })
    },
    funPost : (req, res) => {
        let nuevoValor = req.body.valor
    
        addValue(nuevoValor)
        res.status(200).json({'msg' : 'Elemento insertado', 'valores' : getValues()})
    },    
    funPostAt : (req, res) => {
        let pos = req.params.id
        let nuevoValor = req.body.valor
    
        addValueAt(nuevoValor, pos)
        res.status(200).json({'msg' : 'Elemento insertado', 'valores' : getValues()})
    },    
    funDelete : (req, res) => {
        let indice = parseInt(req.params.id,10)
        
        removeValueAt(indice)
        res.status(200).json({'msg' : 'Elemento borrado', 'valores' : getValues()})
    },    
    funPut : (req, res) => {
        let indice = parseInt(req.params.id,10)
    
        updateValueAt(indice, req.body.valor)
        res.status(200).json({'msg' : 'Elemento modificado', 'valores' : getValues()})
    }
};

// export {
//     controladorGet,
//     controladorGetAt
// }
export default controlador
```

Fíjate que el controlador se exporta como un **objeto** (`export default controlador`), con una propiedad por cada función. Así en `app.js` podremos usar `controlador.funGet`, `controlador.funPost`, etc.

## 3. Los middlewares: `middleware/middlewares.js`

Un **middleware** es una función intermedia que se ejecuta **antes** del controlador. Recibe tres parámetros: `req`, `res` y `next`.

- Si todo es correcto, llama a `next()` para continuar la cadena (y así se ejecuta el siguiente middleware o, finalmente, el controlador).
- Si algo falla, responde directamente con `res.status(...).json(...)` y **no** llama a `next()`, cortando la petición.

```jsx
import { size } from '../database/database.js'

const enLimite = (req,res,next) => {
    const indice = Number(req.params.id);
    if (!Number.isInteger(indice) || indice < 0 || indice >= size()) {
        return res.status(400).json({
            msg: 'Error índice incorrecto'
        });
    }

    next();
}

const otro = (req,res,next) => {
    if (1 == 2){
        return res.status(203).json({'msg':'Error en middleware otro'})
    } else {
        next()
    }
}

export {
    enLimite,
    otro
}
```

- **`enLimite`**: comprueba que el `id` recibido por parámetro de ruta está dentro del rango del array (`0` a `size()-1`).
- **`otro`**: middleware de ejemplo que no hace nada (la condición `1==2` nunca se cumple). Está ahí para que veáis que **se pueden encadenar varios middlewares** en una misma ruta.

> 💡 Idea para practicar: modificad `otro` para que compruebe, por ejemplo, que el body de la petición trae el campo `valor`, devolviendo un error 400 si no es así.

## 4. El servidor y las rutas: `app.js`

`app.js` ahora queda mucho más limpio: solo importa el controlador y los middlewares, y define qué función se ejecuta para cada ruta.

```jsx
import chalk from 'chalk';
import kleur from 'kleur';
import express from 'express'

import controlador from './controllers/MiControlador.js'
import { enLimite, otro } from './middleware/middlewares.js'

const port = 9090
const app = express()

app.use(express.json()) //-> Necesario para poder recibir datos en formato JSON en el body de la petición.

app.get('/', controlador.funGet)

app.get('/:id', [enLimite, otro], controlador.funGetAt)

app.delete('/:id', [enLimite, otro], controlador.funDelete)

app.post('/', controlador.funPost)

app.post('/:id', controlador.funPostAt)

app.put('/:id', enLimite, controlador.funPut)

app.listen(port, () => {
  console.log(kleur.green(`🌎 Servidor corriendo en ${port}`))
})
```

Fíjate en cómo se usan los middlewares en las rutas:

- `app.get('/:id', [enLimite, otro], controlador.funGetAt)` → se ejecutan **primero** `enLimite` y `otro` (en ese orden) y, si ambos llaman a `next()`, se ejecuta finalmente `controlador.funGetAt`.
- `app.put('/:id', enLimite, controlador.funPut)` → cuando solo hay un middleware, no hace falta meterlo en un array.

## Endpoints disponibles

| Método | Ruta    | Middleware(s)     | Controlador            | Descripción                              |
|--------|---------|--------------------|-------------------------|-------------------------------------------|
| GET    | `/`     | —                  | `controlador.funGet`    | Devuelve todos los valores del array      |
| GET    | `/:id`  | `enLimite`, `otro` | `controlador.funGetAt`  | Devuelve el valor en la posición `id`     |
| POST   | `/`     | —                  | `controlador.funPost`   | Añade un valor al final del array         |
| POST   | `/:id`  | —                  | `controlador.funPostAt` | Inserta un valor en la posición `id`      |
| PUT    | `/:id`  | `enLimite`         | `controlador.funPut`    | Modifica el valor en la posición `id`     |
| DELETE | `/:id`  | `enLimite`, `otro` | `controlador.funDelete` | Elimina el valor en la posición `id`      |

Para los endpoints con `body` (POST y PUT), el JSON esperado tiene esta forma:

```json
{
  "valor": 10
}
```

## Instalación y ejecución

1. Instalar las dependencias:

   ```bash
   npm install
   ```

2. Arrancar el servidor:

   ```bash
   npm start
   ```

   O, si queréis que se reinicie solo al guardar cambios (gracias a `nodemon`):

   ```bash
   npm run dev
   ```

3. El servidor queda escuchando en [http://localhost:9090](http://localhost:9090).

## Probar la API

En la raíz del proyecto hay una colección de Postman, **`Node inicial.postman_collection.json`**, que podéis importar en Postman para probar directamente todos los endpoints (`GET /`, `GET /:id`, `POST /`, `POST /:id`, `PUT /:id`, `DELETE /:id`).

También podéis probarlo con `curl`:

```bash
curl http://localhost:9090/
curl http://localhost:9090/2
curl -X POST http://localhost:9090/ -H "Content-Type: application/json" -d '{"valor":10}'
curl -X PUT http://localhost:9090/1 -H "Content-Type: application/json" -d '{"valor":99}'
curl -X DELETE http://localhost:9090/1
```

## Resumen de conceptos clave

- **Separación de responsabilidades**: `app.js` (rutas) → `middleware` (validaciones previas) → `controllers` (lógica de negocio) → `database` (acceso a datos).
- **Controlador como objeto**: se exporta un objeto con una función por cada acción, y se referencia con `controlador.nombreFuncion`.
- **Middlewares encadenados**: se pueden pasar como función suelta o como array de funciones; se ejecutan en orden y cada uno decide si continúa (`next()`) o corta la petición respondiendo directamente.
- **Mismo comportamiento, mejor organización**: la funcionalidad de la API es idéntica a la versión "todo en `app.js`", pero el código es mucho más mantenible y escalable.
