import { createBrowserRouter } from 'react-router-dom';
import { ChatPage } from '../features/chat';
import { PlaygroundPage } from '../features/playground';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatPage />,
  },
  {
    path: '/playground',
    element: <PlaygroundPage />,
  },
]);
