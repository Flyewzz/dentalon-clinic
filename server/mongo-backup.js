const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

// Настройки MongoDB
const MONGO_URL = process.env.MONGO_URL;

// Настройки Google Drive
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH;
const FOLDER_ID = process.env.FOLDER_ID;

// Авторизация в Google Drive API
async function authorize() {
    const auth = new google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    
    return await auth.getClient();
}


// Функция для выполнения команд с использованием промисов
function execPromise(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout ? stdout : stderr);
            }
        });
    });
}

// Функция для создания резервной копии
async function createBackup() {
    const today = new Date().toISOString().split('T')[0];
    const filePath = path.join(__dirname, `backup_${today}.gz`);
    const cmd = `mongodump --uri="${MONGO_URL}" --gzip --archive=${filePath}`;

    try {
        await execPromise(cmd);
        console.log(`Backup created: ${filePath}`);
        return filePath;
    } catch (error) {
        throw new Error(`Error creating backup: ${error.message}`);
    }
}

// Функция для загрузки файла на Google Диск
async function uploadToGoogleDrive(auth, filePath) {
    const drive = google.drive({ version: 'v3', auth });
    const fileName = path.basename(filePath);

    try {
        const fileMetadata = { name: fileName, parents: [FOLDER_ID] };
        const media = { mimeType: 'application/gzip', body: fs.createReadStream(filePath) };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
        console.log(`File uploaded to Google Drive: ${fileName}`);
        return file;
    } catch (error) {
        throw new Error(`Error uploading to Google Drive: ${error.message}`);
    }
}

// Функция для очистки старых резервных копий на Google Диске
async function cleanupOldBackups(auth) {
    const drive = google.drive({ version: 'v3', auth });

    try {
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);

        const res = await drive.files.list({
            q: `'${FOLDER_ID}' in parents`,
            fields: 'files(id, name, createdTime)',
        });

        const files = res.data.files
            .filter(file => file.name.startsWith('backup_'))
            .map(file => ({
                id: file.id,
                name: file.name,
                date: new Date(file.name.split('_')[1].split('.')[0])
            }))
            .sort((a, b) => b.date - a.date);

        console.log('Sorted backups:', files);

        const oldBackups = files.filter(file => file.date < threeDaysAgo);

        console.log('Old backups to remove:', oldBackups);

        for (const file of oldBackups) {
            try {
                await drive.files.delete({ fileId: file.id });
                console.log(`Old backup removed: ${file.name}`);
            } catch (err) {
                console.error(`Error removing old backup: ${err}`);
            }
        }
    } catch (err) {
        console.error(`Error reading Google Drive directory: ${err}`);
    }
}

// Основная функция для создания и загрузки резервной копии
async function createAndUploadBackup() {
    try {
        const auth = await authorize();
        const filePath = await createBackup();
        await uploadToGoogleDrive(auth, filePath);
        await cleanupOldBackups(auth);

        // Удаление локального файла после успешной загрузки
        fs.unlinkSync(filePath);
        console.log(`Local backup file deleted: ${filePath}`);
    } catch (error) {
        console.error(`Error creating and uploading backup: ${error.message}`);
    }
}

// Начальная проверка и создание первой резервной копии
(async () => {
    await createAndUploadBackup();
})();
