import type { NextApiRequest, NextApiResponse } from 'next';
import { applyCors, handleOptions } from '../../utils/cors';

const MAIZE_ML_URL = (
  process.env.NEXT_PUBLIC_MAIZE_API_URL ||
  process.env.MAIZE_API_URL ||
  'https://patrickonly-maize-assitant-monitor-2v2e.onrender.com'
).replace(/\/api\/?$/, '').replace(/\/$/, '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed',
    });
  }

  try {
    const upstream = await fetch(`${MAIZE_ML_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body ?? {}),
    });

    const contentType = upstream.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await upstream.json();

      // --- BACKEND PROGRESSION TRACKER LOGIC ---
      const chatSessionId = req.body.chatSessionId;
      if (chatSessionId && data.type === 'image' && data.valid_image !== false) {
        try {
          const { pool } = await import('../../database/connection');
          const connection = await pool.getConnection();
          try {
            const [messages] = await connection.execute(
              'SELECT content FROM chat_conversation WHERE chat_session_id = ? AND role = "assistant" ORDER BY id DESC LIMIT 1',
              [chatSessionId]
            );
            
            const msgs = messages as any[];
            if (msgs.length > 0) {
              const lastContent = msgs[0].content;
              const currentContent = data.report || data.answer || '';
              
              const oldDiseaseMatch = lastContent.match(/Disease:\s*([^\n]+)/i);
              const newDiseaseMatch = currentContent.match(/Disease:\s*([^\n]+)/i);
              
              if (oldDiseaseMatch && newDiseaseMatch) {
                const oldDisease = oldDiseaseMatch[1].trim();
                const newDisease = newDiseaseMatch[1].trim();
                
                const oldStageMatch = lastContent.match(/Stage:\s*([^\n]+)/i);
                const newStageMatch = currentContent.match(/Stage:\s*([^\n]+)/i);
                
                const oldStage = oldStageMatch ? oldStageMatch[1].trim() : "Unknown";
                const newStage = newStageMatch ? newStageMatch[1].trim() : "Unknown";
                
                let progressionText = "The crop health has changed.";
                if (oldDisease.toLowerCase().includes("healthy") && !newDisease.toLowerCase().includes("healthy")) {
                  progressionText = "The crop health has worsened. Disease detected.";
                } else if (!oldDisease.toLowerCase().includes("healthy") && newDisease.toLowerCase().includes("healthy")) {
                  progressionText = "The crop health has improved! It is now healthy.";
                } else if (oldDisease === newDisease && oldStage === newStage) {
                  progressionText = "The disease state remains unchanged.";
                } else if (oldDisease === newDisease) {
                  progressionText = `The disease is still present, stage changed from ${oldStage} to ${newStage}.`;
                } else {
                  progressionText = "A new disease or condition has been detected.";
                }

                const progressionAlert = `**📈 PROGRESSION ALERT: ${progressionText}**\nLast scan showed "${oldDisease}" (${oldStage}). Today's scan shows "${newDisease}" (${newStage}).\n---\n\n`;
                
                if (data.report) data.report = progressionAlert + data.report;
                if (data.answer) data.answer = progressionAlert + data.answer;
              }
            }
          } finally {
            connection.release();
          }
        } catch (dbError) {
          console.error("Backend progression tracker error:", dbError);
        }
      }
      // --- END PROGRESSION LOGIC ---

      return res.status(upstream.status).json(data);
    }

    const text = await upstream.text();
    return res.status(upstream.status).json({
      ok: upstream.ok,
      message: text || 'Unexpected ML service response',
    });
  } catch (error) {
    console.error('Predict proxy error:', error);
    return res.status(200).json({
      ok: false,
      message:
        'ML diagnosis service is unavailable. Start the maize ML server on port 5000.',
      type: 'text',
      response:
        'Cannot reach the server. Please try again later.',
      source: 'fallback',
    });
  }
}
