// Entry for 404.html. The build already puts the markup in the page
// (vite.config.ts → prerender); dev fills it here.
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/not-found.css';
import { renderNotFound } from './pages/not-found';

const main = document.getElementById('notfound');
if (main && !main.childElementCount) main.innerHTML = renderNotFound();
