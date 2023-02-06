export default (app) => {
    const collaborator = require('#controllers/collaborator');
    const router = require('express').Router();

    router.get('/', collaborator.findAll);
    router.post('/', collaborator.create);

    router.get('/:id', collaborator.findOne);
    router.put('/:id', collaborator.update);
    router.delete('/:id', collaborator.delete);

    app.use('/api/collaborator', router);
};