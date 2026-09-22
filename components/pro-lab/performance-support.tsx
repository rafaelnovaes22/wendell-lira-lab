"use client";

import { Send } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";
import type { PlayerProfile } from "@/lib/pro-lab-types";
import { sendChat } from "@/lib/platform-client";

interface ChatMessage {
  role: "coach" | "user";
  text: string;
}

export function PerformanceSupport({ profile }: { profile: PlayerProfile }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "coach",
      text: `Você chega como ${profile.signals.lastMood}. Me diga o que está se repetindo nas partidas e eu transformo isso em uma ação de treino.`,
    },
  ]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!message.trim() || loading) return;
    const userText = message.trim();
    setError("");
    setLoading(true);
    try {
      const reply = await sendChat(userText);
      setMessage("");
      setMessages((current) => [
        ...current,
        { role: "user", text: userText },
        { role: "coach", text: reply },
      ]);
    } catch {
      setError(
        "Não foi possível conversar agora. Sua mensagem foi preservada para tentar novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" id="coach-ai">
      <div className="shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Performance humana</p>
            <h2 className="section-title">
              Cabeça clara. <span className="outline-word">Jogo simples.</span>
            </h2>
          </div>
          <p className="section-note">
            Apoio emocional de performance para reconhecer pressão, interromper
            tilt e voltar ao plano.
          </p>
        </div>
        <div className="support-grid">
          <div className="glass-panel support-copy">
            <Image
              src="/championship-trophy.png"
              alt="Troféu em uma arena de esports"
              fill
              sizes="50vw"
            />
            <div className="support-content">
              <span className="eyebrow">Protocolo de competição</span>
              <h3>Pressão também se treina.</h3>
              <p>
                Check-ins curtos conectam estado emocional, decisões em jogo e
                carga de treino. Você pode usar esse registro ao conversar com
                seu mentor.
              </p>
              <div className="safety-note">
                Este recurso é coaching de performance, não terapia. Em
                sofrimento emocional, procure um profissional. Em crise, CVV
                188. Em risco imediato, SAMU 192.
              </div>
            </div>
          </div>
          <div className="glass-panel chat-panel">
            <div className="chat-identity">
              <span className="chat-avatar">AI</span>
              <div>
                <strong>Coach WL AI</strong>
                <span>Assistente tático, não é o Wendell Lira</span>
              </div>
            </div>
            <div className="chat-log" aria-live="polite">
              {messages.map((entry, index) => (
                <div
                  className={`chat-bubble ${entry.role === "user" ? "is-user" : ""}`}
                  key={`${entry.role}-${index}`}
                >
                  {entry.text}
                </div>
              ))}
            </div>
            <form className="chat-form" onSubmit={(event) => void send(event)}>
              <input
                className="field"
                aria-label="Mensagem para o Coach WL AI"
                placeholder="Ex.: perco a cabeça quando tomo gol..."
                value={message}
                maxLength={600}
                onChange={(event) => setMessage(event.target.value)}
              />
              <button
                className="pill-button"
                type="submit"
                disabled={loading}
                aria-label="Enviar"
              >
                <Send size={17} />
              </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
