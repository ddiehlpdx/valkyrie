import db from '#models';
const Project = db.project;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    const project = req.body;

    Project.create(project, {
        individualHooks: true
    }).then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `Unable to create project. ${err}.`
        });
    });
};

exports.findAll = async (req, res) => {
    const project = req.body.project;
    const condition = (project) ? { project: { [Op.like]: `%${project}` } } : null;

    Project.findAll({
        where: condition
    }).then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `Unable to retrieve project. ${err}.`
        });
    });
};

exports.findOne = async (req, res) => {
    const id = req.params.id;

    Project.findByPk(id).then(data => {
        if (data) {
            res.send(data);
        }
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `Unable to retrieve project with id=${id}. ${err}.`
        });
    });
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const updateProject = req.body;

    Project.update(updateProject, {
        where: { id: id },
        individualHooks: true

    }).then(data => {
        const [results] = data;

        if (results === 1) {
            res.send(updateProject);
        }
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `Unable to update project with id=${id}. ${err}.`
        });
    });
};

exports.delete = async (req, res) => {
    const id = req.params.id;

    Project.destroy({
        where: { id: id },
        individualHooks: true

    }).then(success => {
        if (success) {
            res.send({
                success: true,
                message: `Project "${id}" removed from database successfully!`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || `Unable to delete project with id=${id}. ${err}.`
        });
    });
};