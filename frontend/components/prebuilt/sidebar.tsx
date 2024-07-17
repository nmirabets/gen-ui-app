import React from 'react';
import {
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setActiveChat: (chatName: string) => void;
  activeChat: string | null;
  chatList: string[];
  onNewChat: () => void;
}

export default function Sidebar({
  isCollapsed,
  toggleSidebar,
  setActiveChat,
  activeChat,
  chatList,
  onNewChat
}: SidebarProps) {
  return (
    <div className={`flex flex-col bg-zinc-800 text-zinc-100 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex h-16 items-center justify-between border-b border-zinc-700 px-4">
        {!isCollapsed && <h1 className="text-xl font-bold">Chatbot App</h1>}
        <button
          onClick={toggleSidebar}
          className="text-zinc-400 hover:text-white focus:outline-none"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-6 w-6" />
          ) : (
            <ChevronLeftIcon className="h-6 w-6" />
          )}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-4">
          {!isCollapsed && (
            <div className="flex justify-between items-center mb-2 px-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Chats
              </h2>
              <button
                onClick={onNewChat}
                className="text-zinc-400 hover:text-white focus:outline-none"
                aria-label="Create new chat"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          {chatList.map((chat) => (
            <SidebarItem
              key={chat}
              chat={{ name: chat }}
              icon={ChatBubbleLeftRightIcon}
              isCollapsed={isCollapsed}
              onClick={() => setActiveChat(chat)}
              isActive={chat === activeChat}
            />
          ))}
        </nav>
      </div>
      <div className="border-t border-zinc-700 p-4">
        <SidebarItem chat={{ name: "John Doe" }} icon={UserCircleIcon} isCollapsed={isCollapsed} />
        <SidebarItem chat={{ name: "Settings" }} icon={Cog6ToothIcon} isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}

interface SidebarItemProps {
  chat: { name: string };
  icon: React.ElementType;
  isCollapsed: boolean;
  onClick?: () => void;
  isActive?: boolean;
}

function SidebarItem({ chat, icon: Icon, isCollapsed, onClick, isActive }: SidebarItemProps) {
  if (isCollapsed) {
    return (
      <div
        className="flex justify-center items-center h-12 w-12 rounded-md text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer"
        onClick={onClick}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
    );
  }
  return (
    <div
      className={`flex items-center rounded-md px-2 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer ${
        isActive ? 'bg-zinc-700 text-white' : ''
      }`}
      onClick={onClick}
    >
      <Icon className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
      <span className="flex-grow truncate">{chat.name}</span>
    </div>
  );
}