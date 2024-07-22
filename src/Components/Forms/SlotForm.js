import React, { useState } from 'react';
import moment from 'moment';
import WordIcon from '../../assets/word.png';

function SlotForm({ initialData, baseUrl }) {
    const [title, setTitle] = useState(initialData.title || '');
    const [start, setStart] = useState(initialData.start ? moment(initialData.start).format('YYYY-MM-DDTHH:mm') : '');
    const [end, setEnd] = useState(initialData.end ? moment(initialData.end).format('YYYY-MM-DDTHH:mm') : '');
    const [phone, setPhone] = useState(initialData.phone || '');
    const [address, setAddress] = useState(initialData.address || '');
    const [type, setType] = useState(initialData.type || 'consultation');
    // const [questions, setQuestions] = useState(initialData.questions || []);

    // const handleQuestionChange = (index, field, value) => {
    //     const updatedQuestions = questions.map((question, qIndex) => {
    //         if (qIndex === index) {
    //             return { ...question, [field]: value };
    //         }
    //         return question;
    //     });
    //     setQuestions(updatedQuestions);
    // };

    return (
        <>
            <input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ФИО пациента" />
            <select name="type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="consultation">Консультация</option>
                <option value="treatment">Лечение</option>
            </select>
            <input type="datetime-local" name="start" value={start} onChange={(e) => setStart(e.target.value)} />
            <input type="datetime-local" name="end" value={end} onChange={(e) => setEnd(e.target.value)} />
            <input type="text" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" />
            <input type="text" name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Адрес" />
            {initialData.questions.length > 0 && (
                <div className="questions-container">
                    <h4 className="questions-title">Вопросы и ответы от пациента</h4>
                    {initialData.questions.map((q, index) => (
                        <div key={index} className="question-answer">
                            <p className="question">{q.question}</p>
                            <div className="answer">{q.answer}</div>
                        </div>
                    ))}
                </div>
            )}
            {initialData.id !== undefined && (
                <div>
                    <h3 className="download-section-title">Документы для скачивания:</h3>
                    <div className="document-section">
                        <a href={`${baseUrl}/contracts/slots/${initialData.id}?docName=1`}
                           className="download-link" download>
                            <img src={WordIcon} alt="Download" width="32" height="32"/>
                            Договор лечения
                        </a>
                        <a href={`${baseUrl}/contracts/slots/${initialData.id}?docName=2`}
                           className="download-link" download>
                            <img src={WordIcon} alt="Download" width="32" height="32"/>
                            Договор ортопедического лечения
                        </a>
                    </div>
                    <button onClick={() => {
                        downloadFile(`${baseUrl}/contracts/slots/${initialData.id}?docName=1`, 'Договор_лечения.docx');
                        downloadFile(`${baseUrl}/contracts/slots/${initialData.id}?docName=2`, 'Договор_ортопедического_лечения.docx');
                    }}>
                        Скачать все
                    </button>
                </div>
            )}
        </>
    );
}

const downloadFile = async (url, filename) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.click();

        // Очистка после скачивания
        window.URL.revokeObjectURL(downloadUrl);
        link.remove();
    } catch (error) {
        console.error('Error downloading the file:', error);
    }
}

export default SlotForm;
