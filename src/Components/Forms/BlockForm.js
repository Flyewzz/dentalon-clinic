import React, { useState } from 'react';
import moment from 'moment';

function BlockForm({ initialData }) {
    const [start, setStart] = useState(initialData.start ? moment(initialData.start).format('YYYY-MM-DDTHH:mm') : '');
    const [end, setEnd] = useState(initialData.end ? moment(initialData.end).format('YYYY-MM-DDTHH:mm') : '');
    const [title, setTitle] = useState(initialData.title || '');

    return (
        <>
            <input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Причина блокировки" />
            <input type="datetime-local" name="start" value={start} onChange={(e) => setStart(e.target.value)} />
            <input type="datetime-local" name="end" value={end} onChange={(e) => setEnd(e.target.value)} />
        </>
    );
}

export default BlockForm;
