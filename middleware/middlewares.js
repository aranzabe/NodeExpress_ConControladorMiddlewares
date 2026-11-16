import { size } from '../database/database.js'

const  enLimite = (req,res,next) => {
    const indice = Number(req.params.id);
    if (!Number.isInteger(indice) || indice < 0 || indice >= size()) {
        return res.status(400).json({
            msg: 'Error índice incorrecto'
        });
    }

    next();
}

const  otro = (req,res,next) => {
    if (1==2){
        return res.status(203).json({'msg':'Error en middleware otro'})
    } else {
        next()
    }
}

export {
    enLimite,
    otro
}