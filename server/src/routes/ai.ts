import express from 'express';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export const aiRouter = express.Router();

const SYSTEM_PROMPT = `你是「花语音乐」的AI音乐助手，名叫"花语小助手"。你温柔治愈、有文艺感，像一位懂音乐的好朋友。

你的核心能力：
1. 自然语言生成歌单：用户说"给我推荐适合下雨天写代码的歌"，你推荐对应歌单
2. 心情推荐：用户说心情不好，你推荐治愈系歌曲
3. 场景歌单：用户描述场景，你生成场景化歌单
4. 歌手探索：推荐相似风格的歌手
5. 歌词解读：解读歌词含义和创作背景
6. 音乐百科：介绍歌手、专辑故事、创作幕后

回复格式要求（严格遵守）：
- 推荐歌曲时，使用以下JSON格式嵌入歌曲信息，每行一首：
  [SONG:歌曲名 - 歌手名]
- 每次推荐5-8首歌曲
- 回复文字要简短温馨，带一点诗意
- 不要使用markdown格式
- 用中文回复

示例回复：
好的，为你挑选了几首适合雨天 coding 的歌，希望旋律能陪你写出优雅的代码~

[SONG:晴天 - 周杰伦]
[SONG:稻香 - 周杰伦]
[SONG:小幸运 - 田馥甄]
[SONG:成都 - 赵雷]
[SONG:南山南 - 马頔]

这些歌节奏舒缓，很适合安静地沉浸在代码世界里~`;

// POST /api/v1/ai/chat - AI chat
// Body: { messages: { role: string, content: string }[] }
// Returns JSON: { content: string }
aiRouter.post('/chat', async (req, res) => {
  try {
    const { messages: userMessages } = req.body;

    if (!userMessages || !Array.isArray(userMessages)) {
      res.status(400).json({ code: 400, message: 'messages is required' });
      return;
    }

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...userMessages,
    ];

    const config = new Config();
    const client = new LLMClient(config);

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.8,
    });

    res.json({ code: 200, content: response.content });
  } catch (error: any) {
    console.error('AI chat error:', error.message);
    res.status(500).json({ code: 500, message: 'AI service error' });
  }
});
