import { AppRouter } from './app/router';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';

function App() {
  return (
    <SiteSettingsProvider>
      <AppRouter />
    </SiteSettingsProvider>
  );
}

export default App;
