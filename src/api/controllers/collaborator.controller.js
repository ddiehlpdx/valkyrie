import db from '#models';
const Collaborator = db.collaborators;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    const collaborator = req.body;

    Collaborator.create(collaborator, {
        individualHooks: true
    }).then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `Unable to create collaborator. ${err}.`
        });
    });
};

exports.findAll = async (req, res) => {
    const collaborator = req.body.collaborator;
    const condition = (collaborator) ? { collaborator: { [Op.like]: `%${collaborator}` } } : null;

    Collaborator.findAll({
        where: condition
    }).then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `Unable to retrieve collaborator. ${err}.`
        });
    });
};

exports.findOne = async (req, res) => {
    const id = req.params.id;

    Collaborator.findByPk(id).then(data => {
        if (data) {
            res.send(data);
        }
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `Unable to retrieve collaborator with id=${id}. ${err}.`
        });
    });
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const updateCollaborator = req.body;

    Collaborator.update(updateCollaborator, {
        where: { id: id },
        individualHooks: true

    }).then(data => {
        const [results] = data;

        if (results === 1) {
            res.send(updateCollaborator);
        }
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `Unable to update collaborator with id=${id}. ${err}.`
        });
    });
};

exports.delete = async (req, res) => {
    const id = req.params.id;

    Collaborator.destroy({
        where: { id: id },
        individualHooks: true

    }).then(success => {
        if (success) {
            res.send({
                success: true,
                message: `Collaborator "${id}" removed from database successfully!`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `Unable to delete collaborator with id=${id}. ${err}`
        });
    });
};
