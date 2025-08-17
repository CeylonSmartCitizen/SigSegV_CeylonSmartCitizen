"use client";

import { useState, useRef, useEffect } from "react";

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Welcome! Ask me anything about Ceylon Smart Citizen services." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      // Dummy AI replies for demo
      const dummyReplies = [
        "How can I help you today?",
        "You can book appointments, check services, or ask about your profile.",
        "For more information, visit the Services page.",
        "I'm here to assist you with Ceylon Smart Citizen services!",
        "Could you please clarify your question?",
        "That's a great question! Let me look it up for you.",
        "You can manage your appointments from the dashboard.",
        "Try asking about available departments or officers."
      ];
      const reply = dummyReplies[Math.floor(Math.random() * dummyReplies.length)];
      await new Promise(r => setTimeout(r, 700)); // Simulate response delay
      setMessages(msgs => [...msgs, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { role: "assistant", content: "Error contacting AI service." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white" style={{ maxWidth: 600, margin: "0 auto", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif" }}>
      <header className="w-full px-4 pt-6 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-black tracking-tight">AI Chat Assistant</h1>
      </header>
      <main className="flex-1 flex flex-col px-4 py-6 overflow-y-auto" style={{ minHeight: 0, paddingBottom: 120 }}>
        <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-2xl px-5 py-3 shadow-md max-w-[80%] text-base whitespace-pre-wrap ${msg.role === "user" ? "bg-blue-600 text-white" : msg.role === "assistant" ? "bg-gray-100 text-gray-900" : "bg-green-50 text-green-900 border border-green-200"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>
  <form onSubmit={sendMessage} className="w-full max-w-2xl mx-auto flex gap-2 px-4 py-2 fixed" style={{ left: 0, right: 0, bottom: 72, margin: '0 auto', maxWidth: 600, zIndex: 60, background: 'rgba(255,255,255,0.97)', borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: '0 -2px 16px 0 #0001' }}>
        <input
          type="text"
          className="flex-1 rounded-2xl border border-gray-200 px-5 py-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
