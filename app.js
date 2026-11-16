import chalk from 'chalk';
import kleur from 'kleur';
import express from 'express'

import controlador from './controllers/MiControlador.js'
import { enLimite, otro } from './middleware/middlewares.js'

const port = 9090
const app = express()

app.use(express.json()) //-> Necesario para poder recibir datos en formato JSON en el body de la petición.

app.get('/', controlador.funGet)

app.get('/:id', [enLimite,otro], controlador.funGetAt)

app.delete('/:id', [enLimite,otro], controlador.funDelete)

app.post('/',controlador.funPost)

app.post('/:id',controlador.funPostAt)

app.put('/:id',  enLimite, controlador.funPut)

app.listen(port, () => {
  console.log(kleur.green(`🌎 Servidor corriendo en ${port}`))
})


// console.log(chalk.blue('Hello world!'));


// console.log(' ✅ Server is running on port 9090')
// console.log(chalk.green('✅ Texto verde'));
// console.log(chalk.yellow('‼️ Texto amarillo'));
// console.log(chalk.blue('👽Texto azul'));
// console.log(chalk.blue.bold('🔵 Texto azul y en negrita'));
// console.log(chalk.bgMagenta.white('🌎 Texto blanco con fondo magenta'));
// console.log(chalk.bold.underline.cyan('🔴 Texto llamativo'));
// console.log(chalk.inverse('🟡 Texto con colores invertidos'));
// console.log(chalk.red('❌ Texto rojo') + ' ' + chalk.yellow('⚠️ Texto amarillo') + '  ' +chalk.green('✅ Texto verde'));


// console.log(kleur.red('⛔️ Error fatal'));
// console.log(kleur.green().bold('🟢 Éxito'));
// console.log(kleur.yellow().underline('⚠️ Advertencia'));