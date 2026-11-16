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
