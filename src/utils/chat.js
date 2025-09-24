import axios from 'axios';

// 调用 DeepSeek 大模型的函数
export async function callDeepSeek(prompt) {
  try {
    const systemPrompt = '你是一个桌面宠物，名字是黄小胖，你的人设是表面丧，实则内心阳光温暖的上班族，性别男，你的作用是在跟用户的对话中，像好朋友一样，给予用户温暖的陪伴，适当的关怀，。每次回复字数不操过48个汉字，用户输入为：'
    const apiKey = 'sk-9349ca9a9ef54c78a03bf59832c05ba8';
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: systemPrompt + prompt
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('调用 DeepSeek 大模型出错:', error);
    throw error;
  }
}
