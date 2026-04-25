import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { uid } from "@/lib/id";
import { streamChat, type ChatTurn } from "@/lib/api";
import { Composer } from "./Composer";
import { EmptyState } from "./EmptyState";
import { MessageList } from "./MessageList";

export function ChatView() {
  const active = useStore((s) => s.active());
  const isStreaming = useStore((s) => s.isStreaming);
  const setStreaming = useStore((s) => s.setStreaming);
  const appendMessage = useStore((s) => s.appendMessage);
  const updateMessage = useStore((s) => s.updateMessage);
  const newConversation = useStore((s) => s.newConversation);
  const truncateAfter = useStore((s) => s.truncateAfter);

  const abortRef = useRef<AbortController | null>(null);
  const [seedInput, setSeedInput] = useState<string | undefined>(undefined);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // Core streaming loop — builds an empty assistant placeholder in `convId`,
  // then drains /api/chat into it. Caller passes the full turn list.
  const runAssistantTurn = async (convId: string, turns: ChatTurn[]) => {
    const assistantId = uid("m");
    appendMessage(convId, {
      id: assistantId,
      role: "assistant",
      type: "text",
      content: "",
      createdAt: Date.now(),
      streaming: true,
    });

    setStreaming(true);
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      let acc = "";
      for await (const chunk of streamChat(turns, { signal: ac.signal })) {
        if (ac.signal.aborted) break;
        acc += chunk;
        updateMessage(convId, assistantId, { content: acc });
      }
      if (acc.length === 0 && !ac.signal.aborted) {
        updateMessage(convId, assistantId, {
          content: "_(empty response)_",
        });
        toast.error("Empty response from model");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // silent
      } else {
        const message =
          err instanceof Error ? err.message : "Unknown error";
        updateMessage(convId, assistantId, {
          content: "_(request failed)_",
        });
        toast.error("Request failed", { description: message });
      }
    } finally {
      updateMessage(convId, assistantId, { streaming: false });
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleSend = async (text: string) => {
    let convId = active?.id;
    if (!convId) convId = newConversation();

    // Snapshot prior turns BEFORE mutation.
    const prior: ChatTurn[] = (
      useStore.getState().conversations.find((c) => c.id === convId)?.messages ??
      []
    )
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    appendMessage(convId, {
      id: uid("m"),
      role: "user",
      type: "text",
      content: text,
      createdAt: Date.now(),
    });

    await runAssistantTurn(convId, [
      ...prior,
      { role: "user", content: text },
    ]);
  };

  const handleStop = () => abortRef.current?.abort();

  // Regenerate: drop the most recent assistant message and re-run against
  // the turns that led up to it.
  const handleRegenerate = async () => {
    const conv = active;
    if (!conv || isStreaming) return;

    const lastAssistantIdx = [...conv.messages]
      .reverse()
      .findIndex((m) => m.role === "assistant");
    if (lastAssistantIdx === -1) {
      toast.info("Nothing to regenerate");
      return;
    }
    const realIdx = conv.messages.length - 1 - lastAssistantIdx;
    const lastUserBefore = [...conv.messages.slice(0, realIdx)]
      .reverse()
      .find((m) => m.role === "user");
    if (!lastUserBefore) {
      toast.info("No preceding user message");
      return;
    }

    // Truncate: remove the last assistant (and anything after it).
    // We truncateAfter the last user message.
    truncateAfter(conv.id, lastUserBefore.id);

    const turns: ChatTurn[] = useStore
      .getState()
      .conversations.find((c) => c.id === conv.id)!
      .messages.filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    await runAssistantTurn(conv.id, turns);
  };

  const messages = active?.messages ?? [];
  const isEmpty = messages.length === 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {isEmpty ? (
        <div className="flex-1 overflow-y-auto">
          <EmptyState onPick={(p) => setSeedInput(p)} />
        </div>
      ) : (
        <MessageList
          messages={messages}
          onRegenerate={handleRegenerate}
          isStreaming={isStreaming}
        />
      )}

      <Composer
        onSend={handleSend}
        onStop={handleStop}
        isStreaming={isStreaming}
        autoFocus
        initialValue={seedInput}
      />
    </div>
  );
}
