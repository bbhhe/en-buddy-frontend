import { AppProvider } from './store';
import { ChatPage } from './features/chat';

function App() {
  return (
    <AppProvider>
      <ChatPage />
    </AppProvider>
  );
}

export default App;
