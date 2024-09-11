import {Sequelize} from "sequelize";


const sequelize = new Sequelize(
   "ecommerce_project",
   "root",
   "",
    {
      host: "localhost",
      dialect: 'mysql'
    }
  );

sequelize.authenticate().then(() => {
   console.log('Kết nối databse thành công!');
}).catch((error) => {
   console.error('Unable to connect to the database: ', error);
});

export default sequelize;