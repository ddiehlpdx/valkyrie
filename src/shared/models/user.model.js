import { Sequelize, DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';

const sequelize = new Sequelize('sqlite::memory:');

class User extends Model { }

User.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    hooks: {
        beforeCreate: (user) => {
            if (user.password) {
                const salt = bcrypt.genSaltSync(10, 'a');
                user.password = bcrypt.hashSync(user.password, salt);
            }
        },
        beforeUpdate: (user) => {
            if (user.password) {
                const salt = bcrypt.genSaltSync(10, 'a');
                user.password = bcrypt.hashSync(user.password, salt);
            }
        }
    },
    defaultScope: {
        attributes: {
            exclude: [
                'id',
                'username',
                'email'
            ]
        }
    },
    scopes: {
        auth: {
            attributes: {
                include: [
                    'id',
                    'username',
                    'email',
                    'password',
                    'isActive',
                    'IsAdmin'
                ]
            }
        }
    },
    sequelize,
    modelName: 'User'
});

