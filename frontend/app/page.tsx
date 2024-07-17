'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/components/prebuilt/sidebar";
import CollapsibleChat from "@/components/prebuilt/collapsible-chat";
import MainChatLayout from "@/components/prebuilt/main-chat-layout";
import Chat from "@/components/prebuilt/chat";

interface ChatMessage {
  role: string;
  content: string;
}

interface ToolUI {
  id: string;
  ui: JSX.Element;
}

interface ChatHistory {
  messages: ChatMessage[];
  tools: ToolUI[];
}

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatHistory>>({});
  const [chatList, setChatList] = useState<string[]>(['Chat 1', 'Chat 2', 'Chat 3']);

  useEffect(() => {
    if (chatList.length > 0 && !activeChat) {
      handleChatSelect(chatList[0]);
    }
  }, [chatList, activeChat]);

  useEffect(() => {
    console.log('Current chat histories:', chatHistories);
  }, [chatHistories]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleChat = () => {
    setIsChatCollapsed(!isChatCollapsed);
  };

  const handleChatSelect = (chatName: string) => {
    setActiveChat(chatName);
    if (!chatHistories[chatName]) {
      setChatHistories(prev => ({ ...prev, [chatName]: { messages: [], tools: [] } }));
    }
  };

  const handleNewMessage = (chatName: string, message: ChatMessage) => {
    setChatHistories(prev => ({
      ...prev,
      [chatName]: {
        ...prev[chatName],
        messages: [...(prev[chatName]?.messages || []), message],
      },
    }));
  };

  const handleNewTool = (chatName: string, tool: ToolUI) => {
    setChatHistories(prev => ({
      ...prev,
      [chatName]: {
        ...prev[chatName],
        tools: [...(prev[chatName]?.tools || []), tool],
      },
    }));
  };

  const handleNewChat = () => {
    const newChatName = `Chat ${chatList.length + 1}`;
    setChatList(prev => [...prev, newChatName]);
    handleChatSelect(newChatName);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        setActiveChat={handleChatSelect}
        activeChat={activeChat}
        chatList={chatList}
        onNewChat={handleNewChat}
      />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <MainChatLayout 
            activeChat={activeChat}
            tools={activeChat ? chatHistories[activeChat]?.tools || [] : []}
          />
        </div>
        <CollapsibleChat 
          isCollapsed={isChatCollapsed} 
          toggleChat={toggleChat}
          activeChat={activeChat}
          chatHistory={activeChat ? chatHistories[activeChat]?.messages || [] : []}
        >
          <Chat
            onNewMessage={(message) => activeChat && handleNewMessage(activeChat, message)}
            onNewTool={(tool) => activeChat && handleNewTool(activeChat, tool)}
            isDisabled={!activeChat}
            chatHistory={activeChat ? chatHistories[activeChat]?.messages || [] : []}
          />
        </CollapsibleChat>
      </main>
    </div>
  );
}