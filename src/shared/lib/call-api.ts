
export async function streamModelReply(
    model: string,
    prompt: string,
    onMessage: (id: string, chunk: string, status: string, timeTaken?: number) => void,
    token: string
){
    const aiId = `${model}-${Date.now()}`;
    const startTime = Date.now();
    onMessage(aiId, "", "typing");

  try {
    const apiHost = process.env.NEXT_PUBLIC_API_HOST || "";
    const endpoint = process.env.NEXT_PUBLIC_MODEL_API_ENDPOINT || "";
    
    
    const res = await fetch(`${apiHost}${endpoint}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
         Authorization: `Bearer ${token}`
        },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const duration = Date.now() - startTime;
      onMessage(aiId, `API error ${res.status}`, "error", duration);
      return;
    }

    if (!res.body) {
      const data = await res.json().catch(() => null);
      const reply = typeof data === "string" ? data : data?.reply ?? "No reply";
      const duration = Date.now() - startTime;
      onMessage(aiId, reply, "completed", duration);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = !!result.done;
      if (result.value) {
        const chunk = decoder.decode(result.value, { stream: true });
        onMessage(aiId, chunk, "streaming", Date.now() - startTime);
      }
    }
    const duration = Date.now() - startTime;
    onMessage(aiId, "", "completed", duration);
  } catch (err) {
    const duration = Date.now() - startTime;
    onMessage(aiId, `Error: ${(err as Error).message}`, "error", duration);
  }
}