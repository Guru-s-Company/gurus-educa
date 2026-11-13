import { useCallback, useState } from "react";
import { initialMessages } from "../mocks/communityMocks";

export function useMessages() {
  const [messages, setMessages] = useState(initialMessages);

  const addMessage = useCallback((newMessage) => {
    setMessages((currentMessages) => [...currentMessages, newMessage]);
  }, []);

  return { messages, addMessage };
}
