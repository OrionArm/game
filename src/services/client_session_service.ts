export class ClientSessionService {
  private static readonly SESSION_KEY = 'game_session_id';

  getCurrentSessionId(): string {
    let sessionId = localStorage.getItem(ClientSessionService.SESSION_KEY);

    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem(ClientSessionService.SESSION_KEY, sessionId);
    }

    return sessionId;
  }

  createNewSession() {
    const sessionId = this.generateSessionId();
    localStorage.setItem(ClientSessionService.SESSION_KEY, sessionId);
  }

  clearSession(): void {
    localStorage.removeItem(ClientSessionService.SESSION_KEY);
    const sessionId = this.getCurrentSessionId();
    localStorage.removeItem(`player_${sessionId}`);
  }

  private generateSessionId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
