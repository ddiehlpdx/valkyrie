import express from 'express';

const users = require('#controllers/user');
const router = express.Router();

const app = express();

router.get('/', users.findAll);
router.post('/', users.create);

router.get('/:id', users.findOne);
router.put('/:id', users.update);
router.delete('/:id', users.delete);

app.use('/api/users', router);

module.exports = router;