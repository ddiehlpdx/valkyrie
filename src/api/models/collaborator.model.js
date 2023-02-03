import { Sequelize, DataTypes, Model } from "sequelize";

const sequelize = new Sequelize('sqlite::memory:');

class Collaborator extends Model { }

Collaborator.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Project',
            key: 'id'
        }
    },
    sequelize,
    modelName: 'Collaborator'
});
Collaborator.hasOne(User);
Collaborator.hasOne(Project);
