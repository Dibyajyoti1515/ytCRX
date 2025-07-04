import ReactDOM from 'react-dom/client';
import App from './App';

function mountApp() {
  const rootEl = document.getElementById('ytnotes-container-root');
  if (rootEl && !rootEl.dataset.mounted) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(<App />);
    rootEl.dataset.mounted = 'true';
    console.log("✅ YTNotes React App rendered");
  } else {
    console.warn("🚫 React app already mounted or #ytnotes-container-root not found");
  }
}

window.askifyMountApp = mountApp;
