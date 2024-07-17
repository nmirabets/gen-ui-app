import React from 'react';

interface ToolUI {
  id: string;
  ui: JSX.Element;
}

interface MainChatLayoutProps {
  activeChat: string | null;
  tools: ToolUI[];
}

export default function MainChatLayout({ activeChat, tools }: MainChatLayoutProps) {
  return (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-bold mb-4">
        {activeChat ? `${activeChat}` : 'Welcome to the Chat App'}
      </h2>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4">
        {tools.length > 0 ? (
          tools.map((tool) => (
            <div key={tool.id} className="mb-4">
              {tool.ui}
            </div>
          ))
        ) : (
          <p>No messages yet. Start a conversation to see content here.</p>
        )}
      </div>
    </div>
  );
}