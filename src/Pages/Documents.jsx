import React from "react";
import styles from "./Documents.css";

const Documents = () => {
    // Названия файлов документов
    const documentTitles = [
        "Лицензия 2019 1стр",
        "Лицензия 2019 2стр",
        "Лицензия 2019 3стр",
        "Управление здравоохранения, удостоверение о повышении квалификации",
        "Стоматология терапевтическая, удостоверение о повышении квалицикации",
        "Стоматология ортопедическая, удостоверение о повышении квалицикации",
        "Основы протезирования и импланты",
        "Сертификат ортодонтия",
        "Удостоверение обращение с отходами",
        "Cертификат Шпилевой сестринское дело",
        "Свидетельство о постановке на учет в налоговом органе",
    ];

    // Генерация документов с путями для изображений и PDF
    const documents = documentTitles.map((title, index) => ({
        id: index + 1, // Автоматическая нумерация
        title,
        image: `/images/${title}.jpg`, // Генерация пути для изображения
        link: `/documents/${title}.pdf`, // Генерация пути для PDF
    }));

    return (
        <div className="contact_section_container" id="documents-page">
            <h2 className="documents-header">Лицензии и документы</h2>
            <div className="documents-container">
                {documents.map((doc) => (
                    <div key={doc.id} className="document-card">
                        <a href={doc.link} target="_blank" rel="noopener noreferrer">
                            <img src={doc.image} alt={doc.title} />
                            <p>{doc.title}</p>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Documents;