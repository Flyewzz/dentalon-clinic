const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./domain/model/User');
const appointmentRoutes = require('./routes/appointmentRoutes'); // Подключение новых маршрутов бронирований
const ContractManager = require('./domain/ContractManager');
const Appointment = require('./domain/model/Appointment');
const moment = require('moment-timezone');
const TokenService = require('./services/TokenService');
const { authenticated, authenticatedDoctor } = require('./middleware/authenticate');

require('dotenv').config();

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

const tokenService = new TokenService({
  jwt_secret: process.env.JWT_SECRET,
  refresh_token_secret: process.env.JWT_REFRESH_SECRET,
})

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

    const docType = req.query.docName === '1' ? 'Договор лечения' : 
        'Договор ортопедического лечения';
    const contractPath = `../controllers/${docType}.docx`;
    const docBuffer = contractManager.buildContract(contractPath, {
      contractNumber: '1935',
      ...formattedDate,
      patientName: appointmentData.name,
      patientAddress: "ул. 50 Лет Октября 4/1, 15",
      patientPhoneNumber: appointmentData.phone,
    });

    const fileName = `${appointmentData.name}.docx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(docType+' '+fileName)}`);
    res.setHeader('Content-Length', docBuffer.length);

    res.send(docBuffer);
  } catch (error) {
    res.status(500).send('Error generating document');
  }
});




// Эндпоинт для обновления токенов
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await refreshAccessToken(refreshToken);
  if (!tokens) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }

  res.setHeader('x-access-token', tokens.accessToken);
  res.setHeader('x-refresh-token', tokens.refreshToken);
  res.json({ message: "Token refreshed successfully" });
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
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password').lean();
    user._id = user._id.toString();
    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
      return res.status(401).json({ message: 'Incorrect Email or Password' });
    }

    const { accessToken, refreshToken } = await tokenService.generateNewTokens(user, req.ip);
    res.setHeader('Access-Control-Expose-Headers', 'X-Access-Token, X-Refresh-Token');
    res.setHeader('X-Access-Token', accessToken);
    res.setHeader('X-Refresh-Token', refreshToken);
    res.status(201).json({ message: 'Login Successfully', userId: user._id, role: user.role });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



app.get('/dental-clinic/user/profile', authenticatedDoctor(tokenService), async (req, res) => {
  // try {
  //   const Appointment_info = await appointment_info.find();
  //   res.send(Appointment_info);
  // } catch (err) {
  //   console.log(err);
  // }
  res.json(req.user);
});

app.listen(process.env.PORT, () => {
  // console.log(require('crypto').randomBytes(32).toString('hex'));
  console.log(`Server Started on Port ${process.env.PORT}`);
});
