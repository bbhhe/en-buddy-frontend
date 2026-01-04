export default function MessageList({ messages }) {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Start a conversation to practice English!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
}
