import React, { useState, useContext } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EndpointsContext } from "@/app/agent";
import { useActions } from "@/utils/client";
import { LocalContext } from "@/app/shared";
import { HumanMessageText } from "./message";

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatProps {
  onNewMessage: (message: ChatMessage) => void;
  onNewTool: (tool: { id: string; ui: JSX.Element }) => void;
  isDisabled: boolean;
  chatHistory: ChatMessage[];
}

function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]); // Remove the data URL prefix
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

function FileUploadMessage({ file }: { file: File }) {
  return (
    <div className="flex w-full max-w-fit ml-auto">
      <p>File uploaded: {file.name}</p>
    </div>
  );
}

export default function Chat({ onNewMessage, onNewTool, isDisabled, chatHistory }: ChatProps) {
  const actions = useActions<typeof EndpointsContext>();
  const onSubmit = useContext(LocalContext);

  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isDisabled || !input.trim()) return;

    let base64File: string | undefined = undefined;
    let fileExtension = selectedFile?.type.split("/")[1];
    if (selectedFile) {
      base64File = await convertFileToBase64(selectedFile);
    }

    onNewMessage({ role: "human", content: input });

    const element = await actions.agent({
      input,
      chat_history: chatHistory.map(msg => [msg.role, msg.content]),
      file:
        base64File && fileExtension
          ? {
              base64: base64File,
              extension: fileExtension,
            }
          : undefined,
    });

    console.log("Element:", element);

    if (selectedFile) {
      onNewTool({
        id: `file-upload-${Date.now()}`,
        ui: <FileUploadMessage file={selectedFile} />,
      });
    }

    onNewTool({
      id: `human-message-${Date.now()}`,
      ui: <HumanMessageText content={input} />,
    });

    onNewTool({
      id: `ai-response-${Date.now()}`,
      ui: <div className="flex flex-col gap-1 w-full max-w-fit mr-auto">{element.ui}</div>,
    });

    // Handle streaming response
    (async () => {
      let lastEvent = await element.lastEvent;
      if (Array.isArray(lastEvent)) {
        if (lastEvent[0].invoke_model && lastEvent[0].invoke_model.result) {
          onNewMessage({ role: "ai", content: lastEvent[0].invoke_model.result });
        } else if (lastEvent[1].invoke_tools) {
          onNewMessage({
            role: "ai",
            content: `Tool result: ${JSON.stringify(lastEvent[1].invoke_tools.tool_result, null)}`,
          });
        }
      } else if (lastEvent.invoke_model && lastEvent.invoke_model.result) {
        onNewMessage({ role: "ai", content: lastEvent.invoke_model.result });
      }
    })();

    setInput("");
    setSelectedFile(undefined);
    if (onSubmit) {
      onSubmit(input);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-row gap-2">
      <Input
        placeholder="What's the weather like in San Francisco?"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isDisabled}
      />
      <div className="w-[300px]">
        <Input
          placeholder="Upload"
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setSelectedFile(e.target.files[0]);
            }
          }}
          disabled={isDisabled}
        />
      </div>
      <Button type="submit" disabled={isDisabled}>
        Submit
      </Button>
    </form>
  );
}