import { createBrowserRouter } from 'react-router-dom';
import { ChatPage } from '../features/chat';
import { PlaygroundPage } from '../features/playground';
import { VocabularyPage } from '../features/vocabulary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatPage />,
  },
  {
    path: '/playground',
    element: <PlaygroundPage />,
  },
  {
    path: '/vocabulary',
    element: <VocabularyPage />,
  },
]);
