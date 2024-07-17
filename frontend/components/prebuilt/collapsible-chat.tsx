import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ChatMessage {
  role: string;
  content: string;
}

interface CollapsibleChatProps {
  isCollapsed: boolean;
  toggleChat: () => void;
  activeChat: string | null;
  chatHistory: ChatMessage[];
  children: ReactNode;
}

export default function CollapsibleChat({ 
  isCollapsed, 
  toggleChat, 
  activeChat, 
  chatHistory,
  children
}: CollapsibleChatProps) {
  const [width, setWidth] = useState(400);
  const minWidth = 300;
  const maxWidth = 800;
  const dragRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current && chatRef.current) {
        const newWidth = document.body.clientWidth - e.clientX;
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = () => {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    if (dragRef.current) {
      dragRef.current.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      if (dragRef.current) {
        dragRef.current.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <div
        ref={dragRef}
        className="w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400 transition-colors"
      />
      <div
        ref={chatRef}
        className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'w-12' : ''
        }`}
        style={{ width: isCollapsed ? '48px' : `${width}px` }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && <h2 className="text-lg font-semibold">{activeChat || 'Chat'}</h2>}
          <button
            onClick={toggleChat}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {isCollapsed ? (
              <ChevronLeftIcon className="h-6 w-6" />
            ) : (
              <ChevronRightIcon className="h-6 w-6" />
            )}
          </button>
        </div>
        {!isCollapsed && (
          <div className="flex-1 overflow-auto flex flex-col">
            <div className="flex-1 p-4">
              {chatHistory.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'human' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded-lg ${message.role === 'human' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {message.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              {children}
            </div>
          </div>
        )}
      </div>
    </>
  );
}