import { Sequelize, DataTypes, Model } from "sequelize";
import User from '#models';

const sequelize = new Sequelize('sqlite::memory:');

class Project extends Model { }

Project.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    owner: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Owner',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Name',
            key: 'id'
        }
    },
    sequelize,
    modelName: 'Project'
});
Project.hasOne(User);