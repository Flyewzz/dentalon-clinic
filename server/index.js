const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./model/userModel');
const appointmentRoutes = require('./routes/appointmentRoutes'); // Подключение новых маршрутов бронирований
const ContractManager = require('./services/ContractManager');
const Appointment = require('./model/Appointment');
const moment = require('moment-timezone');

require('dotenv').config({ path: './.env' });

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connection Successfully');
  })
  .catch((err) => {
    console.log(err.message);
  });

app.get('/', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

app.use('/api/v1/appointments', appointmentRoutes); // Используйте новые маршруты бронирований


const contractManager = new ContractManager();
require('moment/locale/ru'); // импортируем русскую локаль
moment.locale('ru'); // устанавливаем русскую локаль глобально

function getMonthNameInGenitive(monthNumber) {
  const monthNames = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  return monthNames[monthNumber]; // monthNumber должен быть от 0 до 11
}

app.get('/api/v1/contracts/slots/:id', async (req, res) => {
  try {
    const appointmentData = await Appointment.findById({_id: req.params.id}).lean();
    const currentDate = moment(); // Используйте currentDate = moment(appointmentData.date) для использования даты из данных аппойнтмента

    const formattedDate = {
      dayOfDate: currentDate.format('D').toString(), // День месяца
      monthOfDate: getMonthNameInGenitive(currentDate.month()).toString(), // Название месяца (на русском)
      yearOfDate: currentDate.format('YYYY').toString() // Год
    };

    const contractPath = "../controllers/Договор лечения обновленный 2017 — копия.docx";
    const docBuffer = contractManager.buildContract(contractPath, {
      contractNumber: '1935',
      ...formattedDate,
      patientName: appointmentData.name,
      patientAddress: "ул. 50 Лет Октября 4/1, 15",
      patientPhoneNumber: appointmentData.phone,
    });

    const fileName = `Договор лечения ${appointmentData.name}.docx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.setHeader('Content-Length', docBuffer.length);

    res.send(docBuffer);
  } catch (error) {
    res.status(500).send('Error generating document');
  }
});











app.post('/register', async (req, res) => {
  console.log(req.body);

  let saltRounds = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  try {
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      return res.status(401).json({ error: 'Email already Exist' });
    }
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    const userRegister = await user.save();

    if (userRegister) {
      res.status(201).json({ message: 'user registered successfully' });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post('/login_user', async (req, res) => {
  console.log(req.body);

  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.json({ msg: 'Incorrect Email or Password', status: false });

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordValid)
      return res.json({ msg: 'Incorrect Password', status: false });

    delete user.password;
    if (user && isPasswordValid) {
      return res.status(201).json({ message: 'Login Successfully' });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get('/dental-clinic/user/profile', async (req, res) => {
  // try {
  //   const Appointment_info = await appointment_info.find();
  //   res.send(Appointment_info);
  // } catch (err) {
  //   console.log(err);
  // }
});

app.get('/dental-clinic/admin-person', async (req, res) => {});

// app.use((req, res) => {
//   res.status(404).send('Page not Found');
// });

app.listen(process.env.PORT, () => {
  console.log(`Server Started on Port ${process.env.PORT}`);
});
