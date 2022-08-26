import React from 'react';
import ReactDOM from 'react-dom/client';

import { Pixlzr } from './pixlzr';

import 'normalize.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Pixlzr />
    </React.StrictMode>
);
