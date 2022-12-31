import db from '#models';
const User = db.users;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    const user = req.body;

    User.create(user, {
        individualHooks: true
    }).then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `An error occurred whild creating user. ${err}.`
        });
    });
};

exports.findAll = async (req, res) => {
    const username = req.query.username;
    const condition = (username) ? { username: { [Op.like]: `%${username}%` } } : null;

    User.findAll({
        where: condition
    }).then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `An error occurred while retrieving users. ${err}.`
        });
    });
};

exports.findOne = async (req, res) => {
    const id = req.params.id;

    User.findByPk(id).then(data => {
        if (data) {
            res.send(data);
        }
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `An error occurred while retrieving user with id=${id}. ${err}.`
        });
    });
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const updatedUser = req.body;

    User.update(updatedUser, {
        where: { id: id },
        individualHooks: true
    })
        .then(data => {
            const [result] = data;

            if (result === 1) {
                res.send(updatedUser);
            }
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message`An error occurred while updating user with id=${id}. ${err}.`
            });
        });
};

exports.delete = async (req, res) => {
    const id = req.params.id;

    User.destroy({
        where: { id: id },
        individualHooks: true
    })
        .then(success => {
            if (success) {
                res.send({
                    success: true,
                    message: `User "${id}" removed from database successfully!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || `An error occurred while deleting user wit id=${id}. ${id}.`
            });
        });
};