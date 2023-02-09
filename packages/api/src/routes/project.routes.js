export default (app) => {
    const project = require('#controllers/project');
    const router = require('express').Router();

    router.get('/', project.findAll);
    router.post('/', project.create);

    router.get('/:id', project.findOne);
    router.put('/:id', project.update);
    router.delete('/:id', project.delete);

    app.use('/api/project', router);
};